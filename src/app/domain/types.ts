export interface BizUser {
    id: string; // 唯一标识
    name: string; // 用户名称
    email: string; // 用户邮箱
    slug: string; // 用户专属 URL 标识
}

export interface BizUserAdapter {
    createBizUser(user: BizUser): Promise<BizUser>;
    getBizUserById(id: string): Promise<BizUser | null>;
    getBizUserByEmail(email: string): Promise<BizUser | null>;
    getBizUserBySlug(slug: string): Promise<BizUser | null>;
    updateBizUser(
        user: Partial<BizUser> & Pick<BizUser, "id">
    ): Promise<BizUser>;
    deleteBizUser(id: string): Promise<void>;
}
