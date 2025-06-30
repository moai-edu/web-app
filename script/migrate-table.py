#!/usr/bin/env python3
import boto3
import argparse
from boto3.dynamodb.types import TypeSerializer, TypeDeserializer
from botocore.exceptions import ClientError, BotoCoreError
import sys
import time


def migrate_table(source_table_name, source_profile, dest_table_name, dest_profile):
    """
    Migrate data between DynamoDB tables using consistent client interface
    """
    print(f"Migrating data from '{source_table_name}' (profile: {source_profile}) "
          f"to '{dest_table_name}' (profile: {dest_profile})")

    try:
        # Initialize clients with consistent interface
        source_session = boto3.Session(profile_name=source_profile)
        dest_session = boto3.Session(profile_name=dest_profile)

        source_ddb = source_session.client('dynamodb')
        dest_ddb = dest_session.client('dynamodb')

        # Verify tables exist
        def check_table(client, table_name):
            try:
                client.describe_table(TableName=table_name)
                return True
            except ClientError as e:
                print(
                    f"Table access error ({table_name}): {e.response['Error']['Message']}")
                return False

        if not check_table(source_ddb, source_table_name) or \
           not check_table(dest_ddb, dest_table_name):
            sys.exit(1)

        # Initialize type converters
        serializer = TypeSerializer()
        deserializer = TypeDeserializer()

        # Scan source table with pagination
        print(f"Scanning source table '{source_table_name}'...")
        scan_args = {
            'TableName': source_table_name,
            'ReturnConsumedCapacity': 'TOTAL'
        }

        total_items = 0
        start_time = time.time()

        # Manual batch writing (since we're using client interface)
        batch_items = []
        BATCH_SIZE = 25  # DynamoDB batch limit

        while True:
            try:
                response = source_ddb.scan(**scan_args)
                items = response.get('Items', [])

                if not items:
                    print("No items found in source table.")
                    break

                for item in items:
                    try:
                        # Convert DynamoDB JSON to Python types and back
                        python_item = {k: deserializer.deserialize(
                            v) for k, v in item.items()}
                        dynamodb_item = {k: serializer.serialize(
                            v) for k, v in python_item.items()}

                        batch_items.append({
                            'PutRequest': {
                                'Item': dynamodb_item
                            }
                        })

                        # Send batch when reaches size limit
                        if len(batch_items) >= BATCH_SIZE:
                            dest_ddb.batch_write_item(
                                RequestItems={
                                    dest_table_name: batch_items
                                }
                            )
                            total_items += len(batch_items)
                            batch_items = []

                            # Progress reporting
                            if total_items % 100 == 0:
                                elapsed = time.time() - start_time
                                print(
                                    f"Migrated {total_items} items (~{int(total_items/elapsed)} items/sec)")

                    except (TypeError, ValueError) as e:
                        print(f"Error converting item: {str(e)}")
                        continue
                    except ClientError as e:
                        print(
                            f"Item write error: {e.response['Error']['Message']}")
                        continue

                # Handle pagination
                if 'LastEvaluatedKey' in response:
                    scan_args['ExclusiveStartKey'] = response['LastEvaluatedKey']
                else:
                    break

            except ClientError as e:
                print(f"Scan error: {e.response['Error']['Message']}")
                break
            except BotoCoreError as e:
                print(f"Network error: {str(e)}")
                time.sleep(1)
                continue

        # Write remaining items in final batch
        if batch_items:
            dest_ddb.batch_write_item(
                RequestItems={
                    dest_table_name: batch_items
                }
            )
            total_items += len(batch_items)

        elapsed = time.time() - start_time
        print(f"\nMigration complete! Migrated {total_items} items in {elapsed:.2f} seconds "
              f"(~{int(total_items/elapsed)} items/sec)")

    except Exception as e:
        print(f"\nFatal error during migration: {str(e)}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Migrate DynamoDB tables between AWS accounts')
    parser.add_argument(
        'source_table_name',
        help='Source table name'
    )
    parser.add_argument(
        '--source-profile',
        help='AWS profile for source (default: default)',
        default='default',
        required=False
    )
    parser.add_argument(
        'dest_table_name',
        help='Destination table name'
    )
    parser.add_argument(
        '--dest-profile',
        help='AWS profile for destination (default: localstack)',
        default='localstack',
        required=False
    )

    args = parser.parse_args()
    migrate_table(
        args.source_table_name,
        args.source_profile,
        args.dest_table_name,
        args.dest_profile
    )


if __name__ == '__main__':
    main()
