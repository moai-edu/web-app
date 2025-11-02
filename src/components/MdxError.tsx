import { Box, Flex } from '@radix-ui/themes'

interface Props {
    error: string
    mdContent?: string
}

export default function MdxError({ error, mdContent }: Props) {
    return (
        <Flex direction="column" gap="4" p="4">
            <h1>Error: Failed to render markdown content</h1>

            <Box>
                <h2>Error Details:</h2>
                <pre
                    style={{
                        backgroundColor: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px',
                        overflowX: 'auto'
                    }}
                >
                    {error}
                </pre>
            </Box>

            {mdContent && (
                <Box>
                    <h2>Markdown Content:</h2>
                    <div
                        style={{
                            backgroundColor: '#f5f5f5',
                            padding: '1rem',
                            borderRadius: '4px',
                            overflowX: 'auto',
                            position: 'relative'
                        }}
                    >
                        <pre
                            style={{
                                margin: 0,
                                paddingLeft: '3.5em', // Space for line numbers
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            {mdContent.split('\n').map((line, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '1em',
                                            width: '2.5em',
                                            textAlign: 'right',
                                            color: '#666',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span>{line || ' '}</span>
                                </div>
                            ))}
                        </pre>
                    </div>
                </Box>
            )}
        </Flex>
    )
}
