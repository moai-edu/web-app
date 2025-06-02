import sys
import boto3
# from boto3.dynamodb.conditions import Attr


def migrate_dynamodb_table(source_table_name, target_table_name,
                           batch_size=25, filter_expression=None):
    """
    迁移DynamoDB表数据

    :param source_table_name: 源表名
    :param target_table_name: 目标表名
    :param batch_size: 批量写入大小(默认25，DynamoDB最大支持25)
    :param filter_expression: 可选的过滤条件
    """
    dynamodb = boto3.resource('dynamodb')
    source_table = dynamodb.Table(source_table_name)
    target_table = dynamodb.Table(target_table_name)

    # 扫描源表
    scan_kwargs = {
        'Limit': batch_size
    }

    if filter_expression:
        scan_kwargs['FilterExpression'] = filter_expression

    done = False
    start_key = None
    total_items = 0

    while not done:
        if start_key:
            scan_kwargs['ExclusiveStartKey'] = start_key

        response = source_table.scan(**scan_kwargs)
        items = response.get('Items', [])

        if items:
            # 批量写入目标表
            with target_table.batch_writer() as batch:
                for item in items:
                    batch.put_item(Item=item)
                    total_items += 1

            print(f"已迁移 {total_items} 条记录...")

        start_key = response.get('LastEvaluatedKey', None)
        done = start_key is None

    print(f"迁移完成！总共迁移了 {total_items} 条记录")


# 使用示例
if __name__ == "__main__":
    source_table = sys.argv[1]
    target_table = sys.argv[2]
    print(f"开始迁移表 {source_table} 到 {target_table}...")

    # 基本迁移
    migrate_dynamodb_table(source_table, target_table)

    # 带过滤条件的迁移(只迁移status为active的记录)
    # migrate_dynamodb_table('source_table', 'target_table',
    # filter_expression=Attr('status').eq('active'))
