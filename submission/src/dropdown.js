
/**
 * Create dropdown with button
 * 
 */
export default class Dropdown {
    constructor (button) {
        this.closed = true
        this.button = button
        this.button.classList.add('dropdown-btn')
        this.button.addEventListener('click', this.open, true)
    }

    open = e => {
        e.preventDefault()

        if (this.closed) {
            this.closed = false
            this.button.nextElementSibling.style.display = 'block'
            this.button.classList.add('selected')

            window.setTimeout(() => {
                window.document.addEventListener('click', this.close)
            }, 50)
        } else {
            this.close()
        }
    }

    close = e => {
        e.preventDefault()

        window.document.removeEventListener('click', this.close)

        this.button.classList.remove('selected')
        this.button.nextElementSibling.style.display = 'none'
        this.closed = true
    }
}
