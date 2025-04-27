import { en } from './route/index_en'

export default {
    systemTitle: '🚀 MoAI',
    banner: {
        title: '👋 Hey there! Welcome to the MoAI.',
        more: 'Check it out'
    },

    badgeTitle: 'Lightweight & Easy 🎉',
    featureSupport: `🔥 Now with {{feature}} support!`,
    lastUpdated: 'Last updated on:',

    getStarted: 'Get Started',
    userHomePage: 'Home page',

    error: 'Error',

    course: 'Course',
    class: 'Class',
    student: 'Student',
    teacher: 'Teacher',
    name: 'Name',
    invitationCode: 'Invitation Code',
    ops: 'Operation',

    id: 'ID',
    slug: 'URL Slug',
    signout: 'Sign out',
    signin: 'Sign in',
    enter: 'Enter',
    fullname: 'Name',
    email: 'Email',
    delete: 'delete',
    edit: 'edit',
    join: 'join',
    leave: 'leave',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    copy: 'Copy',
    submitting: 'Submitting...',
    submit: 'Submit',
    occupied: 'it is occupied',

    modifyProfile: 'Modify Profile',
    deleteConfirm: 'Are you sure you want to delete this? This action is permanent and cannot be undone.',
    leaveConfirm: 'Are you sure you want to leave this? This action is permanent and cannot be undone.',

    minChar: 'at least {{min}} characters',
    maxChar: 'at most {{max}} characters',
    reservedValidation: 'This name is reserved',
    slugValidation: 'only lowercase letters, numbers, underscores and hyphens are allowed',
    uuidValidation: 'please enter a valid UUID',

    ...en,

    featureList: [
        {
            title: 'Advanced Tech Stack',
            description:
                'Leveraging efficient React (v19) and support with Next.js, Nextra(v4) and Shadcn UI to build modern applications.'
        },
        {
            title: 'internationalization (i18n)',
            description: 'Built-in multi-language support for easy i18n of your application, expanding your user base.'
        },
        {
            title: 'TypeScript Safety',
            description:
                'Fully integrated with TypeScript, offering static type checking to reduce runtime errors and enhance code reliability and maintainability.'
        },
        {
            title: 'Iconify Icons',
            description:
                'Integrated with the Iconify icon set, offering a wide range of icons to enhance UI visual presentation.'
        },
        {
            title: 'Tailwind CSS (v4)',
            description: 'Atomic CSS integrated with Tailwind CSS, enabling efficient design and responsive UI.'
        },
        {
            title: 'Code Standards',
            description:
                'Adheres to best practices with code standards and uses ESLint for quality checks and consistency.'
        },
        {
            title: 'Dark Mode',
            description: 'Supports dark mode for an enhanced nighttime experience.'
        },
        {
            title: 'Rich Components & Extensible Support',
            description: 'Offers a range of built-in components and supports flexible custom extensions.'
        },
        {
            title: 'Lightweight Design',
            description:
                'Employs a lightweight design approach, streamlining project setup to focus on content creation.'
        }
    ],
    featuresDesc: 'Easily build modern applications and kickstart your development process.',
    faqs: [
        {
            question: 'What frameworks and tech stack does this starter template support?',
            answer: 'This starter template supports Next.js and Nextra, with integrated modern development technologies like Tailwind CSS, Framer Motion, and Shadcn UI components.'
        },
        {
            question: 'How do I start developing with this template?',
            answer: 'Simply clone our GitHub repository and follow the steps in the documentation to run the installation commands to get started.'
        },
        {
            question: 'What types of projects is this template suitable for?',
            answer: 'This template is ideal for building fast and efficient modern web applications, including corporate sites, personal blogs, and e-commerce platforms.'
        },
        {
            question: 'How do I add or modify components in the project?',
            answer: 'You can use the provided component library and follow the instructions in the documentation to customize and extend them to suit your specific needs.'
        },
        {
            question: 'Does the template support multiple languages?',
            answer: "Yes, the template includes built-in internationalization (i18n) support, allowing you to easily add and manage multilingual content to expand your app's international user base."
        },
        {
            question: 'How can I get technical support or help?',
            answer: 'If you encounter any issues while using the template, please contact us via GitHub @pdsuwwz.'
        }
    ]
}
