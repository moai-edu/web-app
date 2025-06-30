#!/usr/bin/env python3
import boto3
import argparse


def delete_bucket(bucket_name, profile=None, delete_bucket=False):
    """
    Delete or empty the specified S3 bucket.

    :param bucket_name: Name of the bucket to delete/empty
    :param profile: AWS profile to use (optional)
    :param delete_bucket: Whether to delete the bucket (False by default)
    """
    print(f"Operating on bucket: {bucket_name} using profile: {profile}")

    try:
        # Create a session with the specified profile
        session = boto3.Session(profile_name=profile)
        s3 = session.resource('s3')

        bucket = s3.Bucket(bucket_name)

        # Delete all objects in the bucket
        print(f"Deleting all objects in bucket: {bucket_name}")
        bucket.objects.all().delete()

        if delete_bucket:
            # Delete the bucket itself if requested
            print(f"Deleting bucket: {bucket_name}")
            bucket.delete()
            print(f"Successfully deleted bucket: {bucket_name}")
        else:
            print(
                f"Successfully emptied bucket (bucket not deleted): {bucket_name}")

    except Exception as e:
        print(f"Error operating on bucket {bucket_name}: {str(e)}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description='Delete or empty an S3 bucket')
    parser.add_argument(
        'bucket_name', help='Name of the S3 bucket to operate on')
    parser.add_argument(
        '--profile',
        help='AWS profile to use from credentials file',
        default='default',
        required=False
    )
    parser.add_argument(
        '--delete-bucket',
        help='Delete the bucket (default: False, only empties the bucket)',
        action='store_true',
        required=False
    )

    args = parser.parse_args()

    delete_bucket(args.bucket_name, args.profile, args.delete_bucket)


if __name__ == '__main__':
    main()
