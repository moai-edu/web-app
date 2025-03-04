# 如果环境变量STAGE未定义，则使用dev作为默认值；否则，使用环境变量STAGE中的值
STAGE?=dev

.PHONY: deploy teardown

# 如果不指定stage，则stage=dev
# 自动使用.env
deploy:
	npx sst secret --stage $(STAGE) set NextAuthSecret $(NEXT_AUTH_SECRET)
	npx sst deploy --stage $(STAGE)

teardown:
	npx sst remove --stage $(STAGE)
	npx sst secret remove NextAuthSecret --stage $(STAGE)
