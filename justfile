# 等价于原 Makefile 顶部的 include：先加载 .env，再加载 .env.local（后者覆盖前者）
# 若文件不存在则忽略，等同于 Makefile 中 wildcard 的判断
#
# 注意：just 这里只加载 .env 和 .env.local，**不加载 .env.dev / .env.prod**。
# 对本地开发（just dev）来说，环境变量来自：
#   1. just（本行）：.env + .env.local（同名键 .env.local 覆盖 .env）
#   2. SST CLI：按 --stage 额外加载 .env 和 .env.<stage>（dev 即 .env.dev）
#   3. next dev：自己再加载 .env.local + .env（开发模式）
# .env.dev / .env.prod 只在 `just setup` / `just teardown` 里被 cp 成 .env.production
# 供 sst deploy / sst remove 使用，也就是部署时的环境变量。
set dotenv-command := "cat .env .env.local 2>/dev/null || true"

# 如果环境变量 STAGE 未定义，则使用 dev 作为默认值
STAGE := env_var_or_default("STAGE", "dev")

awslocal := "lstk aws"

TF_USE_VARS := "-var \"bucket_name=$DATA_BUCKET_NAME\" -var \"table_name=$DB_TABLE_NAME\""

# 启动本地开发环境（sst dev）
#
# 调用链：just dev → npx sst dev --stage dev
#   1. SST 以「dev 模式」启动站点（sst.aws.Nextjs 组件），默认执行的是
#      package.json 里的 **dev** 脚本，不是 start。
#      依据：SST 平台源码 ssr-site.ts 的 normalizeDev()：
#        command: output(devArgs.command ?? "npm run dev")
#   2. 所以实际跑的是 package.json 的：
#        "dev": "npm run check-env && concurrently \"just localstack-start\" \"next dev --turbopack\""
#      即：检查 .env.local → 启动 LocalStack → next dev（Turbopack）
#   3. package.json 里的 "start": "next start" 只在本地跑生产构建时用（需先 next build）；
#      线上部署走的是 OpenNext 的 server handler，和 start 无关。
#   4. 想换 dev 模式执行的命令，可以在 infra/web.ts 的 Nextjs 参数里加
#      dev: { command: "..." }（默认就是 npm run dev）。
dev:
    @echo "just dev → npx sst dev --stage dev → 执行 package.json 的 dev 脚本（check-env + localstack + next dev），不是 start"
    npx sst dev --stage dev

# 部署 serverless 应用到 STAGE 环境
setup:
    @echo "setup {{ STAGE }}"
    -npx sst unlock --stage {{ STAGE }}
    @echo "复制 .env.{{ STAGE }} 到 .env.production，因为 sst deploy 命令会读取 .env.production 文件中的环境变量"
    cp -f .env.{{ STAGE }} .env.production
    @echo "启动 sst deploy，部署 serverless 应用到 {{ STAGE }} 环境"
    npx sst deploy --print-logs --stage {{ STAGE }}

# 卸载 STAGE 环境上的 serverless 应用
teardown:
    @echo "teardown {{ STAGE }}"
    -npx sst unlock --stage {{ STAGE }}
    cp -f .env.{{ STAGE }} .env.production
    npx sst remove --stage {{ STAGE }}

# 启动 localstack
localstack-start:
    lstk start --persist

localstack-stop:
    lstk stop

# 清理 localstack，创建 python 虚拟环境，安装tflocal，并初始化 terraform
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

# 在 localstack 上部署 terraform 资源
localstack-tf-setup:
    @echo "setup localstack"
    . .venv/bin/activate && tflocal init && \
        tflocal plan {{ TF_USE_VARS }} && \
        tflocal apply -auto-approve {{ TF_USE_VARS }}

# 销毁 localstack 上的 terraform 资源
localstack-tf-teardown:
    -{{ awslocal }} s3 rm --recursive s3://$DATA_BUCKET_NAME/
    -{{ awslocal }} s3 rm --recursive s3://$DATA_BUCKET_NAME-test/
    . .venv/bin/activate && tflocal destroy {{ TF_USE_VARS }}
    echo rm -rf terraform.tfstate* .terraform.lock.hcl

# 查看 localstack 的配置与资源
localstack-status:
    lstk status
    {{ awslocal }} s3 ls
    {{ awslocal }} s3 ls s3://$DATA_BUCKET_NAME/
    {{ awslocal }} dynamodb describe-table --table-name $DB_TABLE_NAME

# 提交并推送代码到 github 与 gitee
push:
    -git add .
    -git commit -m "同步代码"
    git push github develop
    git push gitee develop

# 扫描 localstack 中的 dynamodb 表
scan-local-db:
    {{ awslocal }} dynamodb scan --table-name $DB_TABLE_NAME

# 扫描远程 dynamodb 表
scan-remote-db:
    {{ awslocal }} dynamodb scan --table-name $REMOTE_DB_TABLE_NAME

# 清空 localstack 中的 dynamodb 表
clean-local-db:
    . .venv/bin/activate && LOCAL=1 TABLE_NAME=$DB_TABLE_NAME python script/clear-table.py

# 清空远程 dynamodb 表
clean-remote-db:
    . .venv/bin/activate && TABLE_NAME=$REMOTE_DB_TABLE_NAME python script/clear-table.py

# 同步 data/docs 到 localstack 的 S3
sync-local-s3:
    {{ awslocal }} s3 sync data/docs s3://$DATA_BUCKET_NAME/docs --delete
    {{ awslocal }} s3 ls s3://$DATA_BUCKET_NAME/docs/

# 同步 data/docs 到远程 S3（需手动执行）
sync-remote-s3:
    @echo This must be done manually.
    @echo because in the begining of this file, .env.local is pointing aws environment variables to localstack.
    @echo aws s3 sync data/docs s3://$REMOTE_DATA_BUCKET_NAME/docs --delete
    @echo aws s3 ls s3://$REMOTE_DATA_BUCKET_NAME/docs/

# 清空 localstack 的 S3 bucket
clean-local-s3:
    {{ awslocal }} s3 rm --recursive s3://$DATA_BUCKET_NAME/

# 清空远程 S3 bucket（需手动执行）
clean-remote-s3:
    @echo This must be done manually.
    @echo because in the begining of this file, .env.local is pointing aws environment variables to localstack.
    @echo aws s3 rm --recursive s3://$REMOTE_DATA_BUCKET_NAME/

# 配置 localstack S3 bucket 的 CORS
cors-local-s3:
    {{ awslocal }} s3api put-bucket-cors \
        --bucket $DATA_BUCKET_NAME \
        --cors-configuration '{ "CORSRules": [ { "AllowedHeaders": [ "*" ], "AllowedMethods": [ "GET" ], "AllowedOrigins": [ "*" ], "ExposeHeaders": [ "ETag" ] } ] }'
