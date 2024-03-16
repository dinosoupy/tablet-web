//Alertbar contains the alert window for the CDSS and additional buttons to access recent visits and menu
import Image from 'next/image';
import AlertMessage from '@/components/AlertBar/AlertMessage'

const alert = {
    type: 'urgent',
    message: 'This is an urgent alert message'
}

const AlertBar = ({ open, setOpen }) => {
    return (
        <div className="mx-auto flex w-full">
            <div className='flex justify-between items-center text-right text-sm font-medium leading-6 border-r w-screen max-w-md px-4' onClick={() => setOpen(!open)}>
                <Image
                    priority
                    src="/recentsIcon.svg"
                    alt="See recent visits"
                    width={20}
                    height={20}
                />
                <p>123457</p>
            </div>

            <div className='flex-1 border-r p-2'>
                <AlertMessage alert={alert} />
            </div>

            <button
                type='button'
                className='flex-none p-2'
                onClick={() => setOpen(false)}
            >
                <Image
                    priority
                    src="/bulletList.svg"
                    alt="See menu"
                    width={20}
                    height={20}
                />
            </button>

        </div>
    )
}

export default AlertBar