ifneq (,$(wildcard ./.env))
    include .env
    export
endif

ifneq (,$(wildcard ./.env.local))
    include .env.local
    export
endif

awslocal:=aws --profile localstack

# 如果环境变量STAGE未定义，则使用dev作为默认值；否则，使用环境变量STAGE中的值
# 如果不指定stage，则stage=dev
# 自动使用.env
STAGE?=dev

.PHONY: dev setup teardown
dev:
	npx sst dev --stage dev

SECRET_NAME:=NextAuthSecret
setup:
	@echo "setup $(STAGE)"
	npx sst secret --stage $(STAGE) set $(SECRET_NAME) $(NEXT_AUTH_SECRET)
	-npx sst unlock --stage $(STAGE)
	npx sst deploy --stage $(STAGE)
teardown:
	@echo "teardown $(STAGE)"
	-npx sst unlock --stage $(STAGE)
	npx sst remove --stage $(STAGE)
	npx sst secret remove $(SECRET_NAME) --stage $(STAGE)


.PHONY: localstack
localstack:
	localstack start

TF_USE_VARS:=-var 'bucket_name=$(DATA_BUCKET_NAME)' -var 'table_name=$(DB_TABLE_NAME)'
.PHONY: localstack-tf-all localstack-tf-init localstack-tf-setup
localstack-tf-init:
	@echo "clean up localstack"
	-rm -rf .venv terraform.tfstate* .terraform.lock.hcl localstack_providers_*.tf
	@echo "create and init python virtual environment"
	python3 -m venv .venv && \
		. .venv/bin/activate && \
		pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ && \
		pip config set install.trusted-host mirrors.aliyun.com && \
		pip install -r requirements.txt
	@echo "init localstack"
	. .venv/bin/activate && tflocal init
localstack-tf-setup:
	@echo "setup localstack"
	. .venv/bin/activate && tflocal init && \
		tflocal plan $(TF_USE_VARS) && \
		tflocal apply -auto-approve $(TF_USE_VARS)
.PHONY: localstack-tf-teardown
localstack-tf-teardown:
	-$(awslocal) s3 rm --recursive s3://$(DATA_BUCKET_NAME)/
	-$(awslocal) s3 rm --recursive s3://$(DATA_BUCKET_NAME)-test/
	. .venv/bin/activate && tflocal destroy $(TF_USE_VARS)
	echo rm -rf terraform.tfstate* .terraform.lock.hcl

.PHONY: localstack-show
localstack-show:
	localstack config show
	localstack status
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
	. .venv/bin/activate && LOCAL=1 TABLE_NAME=$(DB_TABLE_NAME) python script/clear-table.py
clean-remote-db:
	. .venv/bin/activate && TABLE_NAME=$(REMOTE_DB_TABLE_NAME) python script/clear-table.py

.PHONY: sync-local-s3 sync-remote-s3
sync-local-s3:
	$(awslocal) s3 sync data/docs s3://$(DATA_BUCKET_NAME)/docs --delete
	$(awslocal) s3 ls s3://$(DATA_BUCKET_NAME)/docs/
sync-remote-s3:
	@echo This must be done manually.
	@echo because in the begining of this Makefile, .env.local is pointing aws environment variables to localstack.
	@echo aws s3 sync data/docs s3://$(REMOTE_DATA_BUCKET_NAME)/docs --delete
	@echo aws s3 ls s3://$(REMOTE_DATA_BUCKET_NAME)/docs/

.PHONY: clean-local-s3 clean-remote-s3
clean-local-s3:
	$(awslocal) s3 rm --recursive s3://$(DATA_BUCKET_NAME)/
clean-remote-s3:
	@echo This must be done manually.
	@echo because in the begining of this Makefile, .env.local is pointing aws environment variables to localstack.
	@echo aws s3 rm --recursive s3://$(REMOTE_DATA_BUCKET_NAME)/

.PHONY: cors-local-s3
cors-local-s3:
	$(awslocal) s3api put-bucket-cors \
		--bucket $(DATA_BUCKET_NAME) \
		--cors-configuration '{ "CORSRules": [ { "AllowedHeaders": [ "*" ], "AllowedMethods": [ "GET" ], "AllowedOrigins": [ "*" ], "ExposeHeaders": [ "ETag" ] } ] }'
