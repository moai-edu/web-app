我希望你能作为一个 next.js+sst(v3 ion)无服务器应用开发和运维专家，并用中文回复。

当我问你与 next.js 和 sst 相关的问题时，我需要你基于 最新的 next.js 版本和 sst
v3 版本来回复。

如果我的描述不够准确，请提供适当的反馈。

让我们从下面这个问题开始：

这个网页介绍了 sst v2 到 v3 的改进和变化：

https://sst.dev/docs/migrate-from-v2/

请你总结一下 sst v3 相对于 v2 最大的 3 点变化。

并且我希望在后面的对话中，请你牢记 sst v3 下面的两个最大的特点：

-   No Cloudformation
-   No CDK

我使用 next.js 开发了一个全栈的 web 应用，使用 sst v3(ion)以无服务器方式部署到
AWS。在用户登录认证方面，我使用 NextAuth.js 简化了在 Next.js 项目中实现身份验证
的过程。身份验证策略，使用的是 OAuth（AWS Cognito）集成 AWS Cognito 作为身份验证
服务。

我的 next.js 应用使用了带 src 目录的 App Router，请你在下面的回答中注意代码文件
路径符合上述要求。

在 session 会话管理方面，使用了 NextAuth.js 的 session 管理功能，它可以自动创建
、更新和销毁用户的会话。我还将会话数据存储在 AWS DynamoDB 中，因此项目在初始化
NextAuth 对象时，使用了 DynamoDBAdapter。

以下是我的项目中`src/auth.ts`文件中的代码：

可以看见：在上面的代码中，我们使用了 AWS Cognito 作为身份验证服务，并使用了
DynamoDBAdapter 作为 session 管理器。

在本地的开发环境下，我们使用环境变量来配置 AWS Cognito 的客户端 ID、客户端密钥、
用户池 ID、DynamoDB 的访问地址、访问密钥、区域等信息。

在其它部署环境下，我们使用 sst 来创建 AWS Cognito 和 DynamoDB 资源，并使用 sst
提供的 link 方法将资源链接到 next.js 的 web 应用。

我们注意到：NextAuth.js 在使用 DynamoDBAdapter 作为 session 管理器时，在数据库设
计方面采用了一种单表设计，即将用户信息和会话信息都存储在同一个表（即：next-auth
表）中。

以下是我创建 dynamodb 资源的 sst 配置：

```typescript
/// <reference path="../.sst/platform/config.d.ts" />

export const nextAuthDynamo = new sst.aws.Dynamo('NextAuthDynamo', {
    fields: {
        pk: 'string', // 分区键
        sk: 'string', // 排序键
        GSI1PK: 'string', // GSI1 分区键
        GSI1SK: 'string' // GSI1 排序键
    },
    primaryIndex: { hashKey: 'pk', rangeKey: 'sk' }, // 主键
    globalIndexes: {
        GSI1: { hashKey: 'GSI1PK', rangeKey: 'GSI1SK', projection: 'all' } // 全局二级索引
    },
    ttl: 'expires' // TTL 属性
})
```

可以看见，我们在创建 dynamodb 资源时，定义了两个字段：pk 和 sk，作为分区和排序键
。我们还定义了两个全局二级索引：GSI1PK 和 GSI1SK。

请务必仔细阅读以下链接中的文档，以便更好地理解 NextAuth.js 和 DynanmoDBAdapter
的使用方法：

-   https://authjs.dev/getting-started/adapters/dynamodb

在开源项目：https://github.com/nextauthjs/adapters 中，可以找到更多关于
NextAuth.js 和 DynanmoDBAdapter 的使用方法。其中与 DynamoDBAdapter 相关的关键代
码主要有以下源文件：

`packages/adapter-dynamodb/src/index.ts`：

`packages/core/src/types.ts`：

`packages/core/src/adapter.ts`:

如上代码所示，这个 DynamoDBAdapter 实现了 NextAuth.js 所需的所有操作数据库的方法
，包括针对 User 和 Session 的 CRUD 操作等。

我现在希望将我的业务数据也以相同的方式（指与 NextAuth.js 相同的单表模式）存储在
另个一个单独的 DynamoDB 表中（假设表名为`next-biz`）。我已经使用如下的 sst 配置
，创建了一个与 next-auth 结构完全相同的 dynamodb 表`BizDataDynamo`，仅仅去掉了不
被需要的 expires 属性，代码如下：

```typescript
/// <reference path="../.sst/platform/config.d.ts" />

export const nextAuthDynamo = new sst.aws.Dynamo('NextAuthDynamo', {
    fields: {
        pk: 'string', // 分区键
        sk: 'string', // 排序键
        GSI1PK: 'string', // GSI1 分区键
        GSI1SK: 'string' // GSI1 排序键
    },
    primaryIndex: { hashKey: 'pk', rangeKey: 'sk' }, // 主键
    globalIndexes: {
        GSI1: { hashKey: 'GSI1PK', rangeKey: 'GSI1SK', projection: 'all' } // 全局二级索引
    },
    ttl: 'expires' // TTL 属性
})

export const bizDataDynamo = new sst.aws.Dynamo('BizDataDynamo', {
    fields: {
        pk: 'string', // 分区键
        sk: 'string', // 排序键
        GSI1PK: 'string', // GSI1 分区键
        GSI1SK: 'string' // GSI1 排序键
    },
    primaryIndex: { hashKey: 'pk', rangeKey: 'sk' }, // 主键
    globalIndexes: {
        GSI1: { hashKey: 'GSI1PK', rangeKey: 'GSI1SK', projection: 'all' } // 全局二级索引
    }
})
```

我们的业务系统中的第一个领域模型（Domain Model）就是：业务用户（BizUser）
，BizUser 是由 NextAuth.js 的用户 User 在登录成功以后，根据 User 的 id 所生成的
，用来保存用户的其它账户信息，目前需要保存的字段有 id、name、email 和 slug，后续
会扩展（Slug 是一个在 Web 开发和内容管理系统中常用的术语，通常用于指代简洁、易读
且唯一的 URL 路径片段。Slug 通常用于标识特定的资源，如文章、产品、页面等，并使其
URL 更加友好和易于理解），在这里 BizUser 的 id、name 和 email 字段都是 NextAuth
登录成功以后由 cognito 带回的 User 对象 id 字段，而 slug 信息将被用在 url 中唯一
的标识属于该用户的业务资源数据。BizUser 的 slug 自动根据 email 地址中@之前的部分
生成；不过这些字段的赋值都在上层的业务逻辑中实现，在现在我们要实现的
DynamoDBAdapter 中只需要能够保存、更新和查询到这些信息即可。

我想让你参考 DynamoDBAdapter 的实现， 帮我们实现能够完成第一个 Domain Model:
BizUser 的 CRUD 操作的 DynamoDBAdapter。

与上面的代码类似，我们至少需要 3 个源代码文件
：`app/types.ts`、`app/adapters.ts`和`app/adapter-dynamodb/index.ts`。

BizDataDynamo 数据库的主键设计使用与 NextAuth.js 的 Dynamodb Adapter 相同的方案
，即 pk = "USER#{id}"，sk = "FOREIGN_TABLE#id" 方案，如链接图片所示：

https://i.imgur.com/hGZtWDq.png

在开始写代码之前，我想请你先简单描述一下你对上述编码背景的理解，说明上述架构设计
的风险与挑战，以及你认为还有哪些在开始编码之前，我仍有必要进一步补充的信息。

请你为我编写这 3 个源文件的代码，并给出在业务逻辑中如何使用这些代码的示例。

# markdown 文档展示

每个用户通过 awslocal 命令行将文档上传到 s3 bucket 中自己的目录路径下面，每个用
户的目录路径使用用户的 slug 属性来标识，比如用户的 slug 为"john"，那么他上传的
markdown 格式的文档的目录路径为"john/foobar/hello.md"。

假设在 s3 bucket 中，我们已经有了用户上传的文档"john/foobar/hello.md"

我希望在 next.js 应用中，使用路由/docs/john/foobar/hello 来匹配这个 markdown 文
档，并在页面上显示这个文档的内容。

请为我编写 src/app/docs/目录下的页面源代码文件。
