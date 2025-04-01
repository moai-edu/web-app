import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import HelloPage from './page'

test('HelloPage', () => {
    render(<HelloPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Hello, World!' })).toBeDefined()
})
