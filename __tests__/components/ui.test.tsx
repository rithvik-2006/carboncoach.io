import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

describe('Shadcn UI Components', () => {
  it('renders Input component correctly and handles change', () => {
    const handleChange = jest.fn()
    render(<Input placeholder="Enter CO2" onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText('Enter CO2') as HTMLInputElement
    expect(input).toBeInTheDocument()
    
    fireEvent.change(input, { target: { value: '10' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(input.value).toBe('10')
  })

  it('renders Button component and handles click', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Log Activity</Button>)
    
    const button = screen.getByRole('button', { name: /Log Activity/i })
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
