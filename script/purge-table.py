#!/usr/bin/env python3
import boto3
import argparse
from botocore.exceptions import ClientError


def purge_table(table_name, profile=None, delete_table=False):
    """
    Purge or delete the specified DynamoDB table.

    :param table_name: Name of the table to purge/delete
    :param profile: AWS profile to use (optional)
    :param delete_table: Whether to delete the table (False by default)
    """
    print(f"Operating on table: {table_name} using profile: {profile}")

    try:
        # Create a session with the specified profile
        session = boto3.Session(profile_name=profile)
        dynamodb = session.resource('dynamodb')

        table = dynamodb.Table(table_name)

        # Get complete key schema
        key_attrs = [key['AttributeName'] for key in table.key_schema]
        print(f"Table key schema: {', '.join(key_attrs)}")

        # Scan and delete all items in the table
        print(f"Scanning and deleting all items in table: {table_name}")
        scan_kwargs = {
            'ProjectionExpression': ', '.join(key_attrs)
        }

        with table.batch_writer() as batch:
            while True:
                response = table.scan(**scan_kwargs)

                # If table is empty, break the loop
                if not response.get('Items'):
                    print("Table is empty, no items to delete")
                    break

                for item in response['Items']:
                    # Build complete key with all key attributes
                    key = {attr: item[attr] for attr in key_attrs}
                    try:
                        batch.delete_item(Key=key)
                    except ClientError as e:
                        print(f"Failed to delete item {key}: {str(e)}")
                        continue

                # Check if there are more items to scan
                if 'LastEvaluatedKey' not in response:
                    break

                scan_kwargs['ExclusiveStartKey'] = response['LastEvaluatedKey']

        if delete_table:
            # Delete the table itself if requested
            print(f"Deleting table: {table_name}")
            table.delete()
            print(f"Successfully deleted table: {table_name}")
        else:
            print(
                f"Successfully purged table (table not deleted): {table_name}")

    except Exception as e:
        print(f"Error operating on table {table_name}: {str(e)}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description='Purge or delete a DynamoDB table')
    parser.add_argument(
        'table_name', help='Name of the DynamoDB table to operate on')
    parser.add_argument(
        '--profile',
        help='AWS profile to use from credentials file',
        default='default',
        required=False
    )
    parser.add_argument(
        '--delete-table',
        help='Delete the table (default: False, only purges items)',
        action='store_true',
        required=False
    )

    args = parser.parse_args()

    purge_table(args.table_name, args.profile, args.delete_table)


if __name__ == '__main__':
    main()
