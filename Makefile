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

.PHONY: dev setup teardown

# 如果不指定stage，则stage=dev
# 自动使用.env
dev:
	npx sst dev --stage dev

setup:
	npx sst secret --stage $(STAGE) set $(SECRET_NAME) $(NEXT_AUTH_SECRET)
	-npx sst unlock --stage $(STAGE)
	npx sst deploy --stage $(STAGE)

teardown:
	npx sst remove --stage $(STAGE)
	npx sst secret remove $(SECRET_NAME) --stage $(STAGE)

.PHONY: localstack localstack-apply localstack-destroy localstack-show
localstack:
	PERSISTENCE=1 && localstack start

localstack-apply:
	@echo "confirm that you have added the following line to the /etc/hosts file:"
	@echo "127.0.0.1 $(DATA_BUCKET_NAME).s3.localhost.localstack.cloud"
	@echo "otherwise, the s3 bucket creations will fail."
	tflocal init && \
		tflocal plan  -var 'bucket_name=$(DATA_BUCKET_NAME)' -var 'table_name=$(DB_TABLE_NAME)' && \
		tflocal apply -var 'bucket_name=$(DATA_BUCKET_NAME)' -var 'table_name=$(DB_TABLE_NAME)' -auto-approve

localstack-destroy:
	tflocal destroy -var 'bucket_name=$(DATA_BUCKET_NAME)' -var 'table_name=$(DB_TABLE_NAME)' -auto-approve
	rm -rf .terraform terraform.tfstate* .terraform.lock.hcl


localstack-show:
	$(awslocal) s3 ls
	$(awslocal) s3 ls s3://$(DATA_BUCKET_NAME)/
	$(awslocal) dynamodb describe-table --table-name $(DB_TABLE_NAME)

.PHONY: push
push:
	-git add .
	-git commit -m "同步代码"
	git push github develop
	git push gitee develop

.PHONY: doc
doc: doc/deploy.png
doc/deploy.png: index.drawio
	draw.io -x -f png -p 3 -o doc/deploy.png index.drawio

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
	@echo This must be done manually.
	@echo because in the begining of this Makefile, .env.local is pointing aws environment variables to localstack.
	@echo aws s3 sync data/docs s3://$(REMOTE_DATA_BUCKET_NAME)/docs --delete
	@echo aws s3 ls s3://$(REMOTE_DATA_BUCKET_NAME)/docs/
