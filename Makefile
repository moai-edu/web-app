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
tflocal:
	echo "在本地开发环境的localstack中，初始化dynamodb表，tflocal命令需要在windows cmd中运行。"
	tflocal init
	tflocal plan
	tflocal apply
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
