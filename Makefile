ifneq (,$(wildcard ./.env))
    include .env
    export
endif

ifneq (,$(wildcard ./.env.local))
    include .env.local
    export
endif

# 如果环境变量STAGE未定义，则使用dev作为默认值；否则，使用环境变量STAGE中的值
STAGE?=dev
SECRET_NAME:=NextAuthSecret
awslocal:=aws --profile localstack

.PHONY: dev deploy teardown

# 如果不指定stage，则stage=dev
# 自动使用.env
dev:
	npx sst dev --stage dev

deploy:
	npx sst secret --stage $(STAGE) set $(SECRET_NAME) $(NEXT_AUTH_SECRET)
	-npx sst unlock --stage $(STAGE)
	npx sst deploy --stage $(STAGE)

teardown:
	npx sst remove --stage $(STAGE)
	npx sst secret remove $(SECRET_NAME) --stage $(STAGE)

.PHONY: localstack tflocal
localstack:
	PERSISTENCE=1 localstack start

localstack-apply:
	echo "在本地开发环境的localstack中，初始化dynamodb表，tflocal命令需要在windows cmd中运行。"
	set TF_VAR_bucket_name=$(DATA_BUCKET_NAME)&& set TF_VAR_table_name=$(DB_TABLE_NAME)&& tflocal init && tflocal plan && tflocal apply

localstack-destroy:
	set TF_VAR_bucket_name=$(DATA_BUCKET_NAME)&& set TF_VAR_table_name=$(DB_TABLE_NAME)&& tflocal destroy

localstack-show:
	$(awslocal) s3 ls s3://$(DATA_BUCKET_NAME)/
	$(awslocal) dynamodb describe-table --table-name $(DB_TABLE_NAME)

.PHONY: push
push:
	git add .
	git commit -m "同步代码"
	git push github develop
	git push gitee develop

.PHONY: doc
doc: doc/deploy.png
doc/deploy.png: index.drawio
	draw.io -x -f png -p 3 -o doc/deploy.png index.drawio

REMOTE_DB_TABLE_NAME:=portal-site-dev-BizDataDynamoTable-mbouwtna

.PHONY: scan-local-db scan-remote-db
scan-local-db:
	$(awslocal) dynamodb scan --table-name $(DB_TABLE_NAME)
scan-remote-db:
	$(awslocal) dynamodb scan --table-name $(REMOTE_DB_TABLE_NAME)

.PHONY: clean-local-db clean-remote-db
clean-local-db:
	LOCAL=1 TABLE_NAME=$(DB_TABLE_NAME) python script/clear-table.py
clean-remote-db:
	TABLE_NAME=$(REMOTE_DB_TABLE_NAME) python script/clear-table.py

.PHONY: sync-local-s3 sync-remote-s3
sync-local-s3:
	$(awslocal) s3 sync data/docs s3://$(DATA_BUCKET_NAME)/docs --delete
	$(awslocal) s3 ls s3://$(DATA_BUCKET_NAME)/docs/
sync-remote-s3:
	aws s3 sync data/docs s3://$(REMOTE_DATA_BUCKET_NAME)/docs --delete
