#!/usr/bin/env python3
import boto3
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
from botocore.exceptions import ClientError


def migrate_bucket(source_bucket_name, source_profile, dest_bucket_name, dest_profile):
    """
    Migrate all objects from source S3 bucket to destination S3 bucket using client-side transfer.
    """
    print(f"Migrating objects from '{source_bucket_name}' (profile: {source_profile}) "
          f"to '{dest_bucket_name}' (profile: {dest_profile})")

    try:
        # Create sessions with explicit configuration
        source_session = boto3.Session(profile_name=source_profile)
        dest_session = boto3.Session(profile_name=dest_profile)

        source_s3 = source_session.client('s3')
        dest_s3 = dest_session.client('s3')

        # Verify buckets
        def check_bucket(client, bucket_name, is_source=True):
            try:
                client.head_bucket(Bucket=bucket_name)
                return True
            except ClientError as e:
                env = "Source" if is_source else "Destination"
                print(
                    f"{env} bucket error ({bucket_name}): {e.response['Error']['Message']}")
                return False

        if not check_bucket(source_s3, source_bucket_name, True) or \
           not check_bucket(dest_s3, dest_bucket_name, False):
            sys.exit(1)

        # List all objects
        print(f"Listing objects in '{source_bucket_name}'...")
        objects = []
        paginator = source_s3.get_paginator('list_objects_v2')
        try:
            for page in paginator.paginate(Bucket=source_bucket_name):
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if not obj['Key'].endswith('/') and obj['Size'] > 0:
                            objects.append(obj)
                            if len(objects) % 500 == 0:
                                print(f"Found {len(objects)} objects...")
        except ClientError as e:
            print(f"Listing failed: {e.response['Error']['Message']}")
            sys.exit(1)

        if not objects:
            print("No objects to migrate.")
            return
        print(f"Total objects to migrate: {len(objects)}")

        # Copy function with proper stream handling
        def copy_object(obj):
            try:
                # Get object with error handling
                try:
                    response = source_s3.get_object(
                        Bucket=source_bucket_name,
                        Key=obj['Key']
                    )
                except ClientError as e:
                    return False, f"Get failed: {e.response['Error']['Message']}"

                # Read content immediately (for small/medium files)
                try:
                    content = response['Body'].read()
                    metadata = response.get('Metadata', {})
                    content_type = response.get('ContentType')
                except Exception as e:
                    return False, f"Read failed: {str(e)}"
                finally:
                    response['Body'].close()

                # Put object with retry
                try:
                    dest_s3.put_object(
                        Bucket=dest_bucket_name,
                        Key=obj['Key'],
                        Body=content,
                        Metadata=metadata,
                        ContentType=content_type
                    )
                    return True, None
                except ClientError as e:
                    return False, f"Put failed: {e.response['Error']['Message']}"

            except Exception as e:
                return False, f"Unexpected error: {str(e)}"

        # Migration with progress tracking
        print("Starting migration...")
        success_count = 0
        failed_count = 0
        failed_objects = []

        with ThreadPoolExecutor(max_workers=5) as executor:  # Reduced concurrency
            futures = {
                executor.submit(copy_object, obj): obj['Key']
                for obj in objects
            }

            for future in as_completed(futures):
                key = futures[future]
                try:
                    success, error = future.result()
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1
                        failed_objects.append((key, error))
                except Exception as e:
                    failed_count += 1
                    failed_objects.append((key, str(e)))

                # Progress reporting
                processed = success_count + failed_count
                if processed % 100 == 0 or processed == len(objects):
                    print(f"Progress: {processed}/{len(objects)} "
                          f"({success_count} success, {failed_count} failed)")

        # Result summary
        print(f"\nMigration complete!")
        print(f"Successfully copied: {success_count}")
        print(f"Failed: {failed_count}")

        if failed_objects:
            print("\nSample failed objects:")
            for key, error in failed_objects[:10]:
                print(f"- {key}: {error}")
            if len(failed_objects) > 10:
                print(f"... and {len(failed_objects)-10} more")

    except Exception as e:
        print(f"\nFatal error: {str(e)}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Migrate S3 buckets between AWS and LocalStack')
    parser.add_argument(
        'source_bucket_name',
        help='Source bucket name (AWS)'
    )
    parser.add_argument(
        '--source-profile',
        help='AWS profile for source (default: default)',
        default='default',
        required=False
    )
    parser.add_argument(
        'dest_bucket_name',
        help='Destination bucket name (LocalStack)'
    )
    parser.add_argument(
        '--dest-profile',
        help='AWS profile for destination (default: localstack)',
        default='localstack',
        required=False
    )

    args = parser.parse_args()
    migrate_bucket(
        args.source_bucket_name,
        args.source_profile,
        args.dest_bucket_name,
        args.dest_profile
    )


if __name__ == '__main__':
    main()
