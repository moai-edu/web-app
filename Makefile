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
	npx sst deploy --stage $(STAGE)

teardown:
	npx sst remove --stage $(STAGE)
	npx sst secret remove $(SECRET_NAME) --stage $(STAGE)

.PHONY: localstack tflocal
localstack:
	PERSISTENCE=1 localstack start
tflocal:
	tflocal init
	tflocal plan
	tflocal apply
	$(awslocal) dynamodb describe-table --table-name next-auth

.PHONY: scan
scan:
	$(awslocal) dynamodb scan --table-name next-auth