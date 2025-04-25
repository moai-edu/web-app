DATA_BUCKET_NAME:=portal-site-data
REMOTE_DATA_BUCKET_NAME:=portal-site-dev-databucketbucket-wnrswdod

awslocal:=aws --profile localstack

EXCLUDE:=--exclude "Makefile" --exclude ".vscode/*" --exclude "*.drawio*"

.PHONY: all clean
all: remote local

.PHONY: remote local
remote:
	aws s3 sync . s3://$(REMOTE_DATA_BUCKET_NAME)/docs/xin/course/dev --delete $(EXCLUDE)
local:
	$(awslocal) s3 sync . s3://$(DATA_BUCKET_NAME)/docs/xin/course/dev --delete $(EXCLUDE)

clean:
	aws s3 rm s3://$(REMOTE_DATA_BUCKET_NAME)/docs/xin/course/dev --recursive
	$(awslocal) s3 rm s3://$(DATA_BUCKET_NAME)/docs/xin/course/dev --recursive