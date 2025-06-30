#!/usr/bin/env python3
import boto3
import argparse


def scan_table(table_name, profile=None, max_return=None):
    """
    Scan the specified DynamoDB table and return items.

    :param table_name: Name of the table to scan
    :param profile: AWS profile to use (optional)
    :param max_return: Maximum number of items to return (None for all items)
    """
    print(f"Scanning table: {table_name} using profile: {profile}")
    if max_return is not None:
        print(f"Maximum items to return: {max_return}")

    try:
        # Create a session with the specified profile
        session = boto3.Session(profile_name=profile)
        dynamodb = session.resource('dynamodb')

        table = dynamodb.Table(table_name)
        items = []
        scan_kwargs = {}

        # Start scanning the table
        print(f"Starting scan on table: {table_name}")
        done = False
        while not done:
            response = table.scan(**scan_kwargs)
            items.extend(response.get('Items', []))

            # Check if we've reached the max_return limit
            if max_return is not None and len(items) >= max_return:
                items = items[:max_return]
                done = True
                print(f"Reached maximum return limit of {max_return} items")
                break

            # Check if there are more items to scan
            if 'LastEvaluatedKey' in response:
                scan_kwargs['ExclusiveStartKey'] = response['LastEvaluatedKey']
            else:
                done = True

        # Print the results
        print(f"\nScan completed. Found {len(items)} items:")
        for i, item in enumerate(items, 1):
            print(f"\nItem {i}:")
            for key, value in item.items():
                print(f"  {key}: {value}")

        return items

    except Exception as e:
        print(f"Error scanning table {table_name}: {str(e)}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description='Scan a DynamoDB table and return items')
    parser.add_argument(
        'table_name', help='Name of the DynamoDB table to scan')
    parser.add_argument(
        '--profile',
        help='AWS profile to use from credentials file',
        default='default',
        required=False
    )
    parser.add_argument(
        '--max-return',
        help='Maximum number of items to return (default: None for all items)',
        type=int,
        default=None,
        required=False
    )

    args = parser.parse_args()

    scan_table(args.table_name, args.profile, args.max_return)


if __name__ == '__main__':
    main()
