// AlertMessage displays the alert message and its icon corresponding to its urgency level
import Image from 'next/image'
import { getAlertIcon } from '@/app/utils';

const AlertMessage = ({ alert }) => {
    return (
        <div className="flex text-right text-sm font-medium leading-6">
            <Image
                src={getAlertIcon(alert)}
                alt="Alert icon"
                height={20}
                width={20}
            />
            <p>
                {alert.message}
            </p>
        </div>
    )
}

export default AlertMessage