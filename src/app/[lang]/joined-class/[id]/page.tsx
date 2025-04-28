import { auth } from '@/auth'
import { UserJoinClassDomain } from '@/domain/user_join_class_domain'
import { I18nLangKeys } from '@/i18n'
import { redirect } from 'next/navigation'

interface Props {
    params: Promise<{ lang: I18nLangKeys; id: string }>
}

export default async function JoinedClassPage({ params }: Props) {
    const { lang, id } = await params

    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return <div>Not authenticated</div>
    }

    // const domain = new UserJoinClassDomain()
    // const url = await domain.getCourseUrlById(id)
    // console.log(url)
    // redirect(url)
}
