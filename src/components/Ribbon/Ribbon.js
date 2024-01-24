// components/Ribbon.js

import PatientInfoBox from '@/components/Ribbon/PatientInfoBox'
import InsuranceInfoBox from '@/components/Ribbon/InsuranceInfoBox'

const patient_info = {
    name: 'Debabrata',
    id: '696969',
    age: '69',
    gender: 'Fluid'
}

const insurance_info = {
    provider: 'Medicare',
    number: '1234567',
    group: '35-B'
}

const Ribbon = () => {
    return (
        <div className="mx-auto flex w-full bg-white px-4 py-4">
            <div className='flex-1 justify-start'>
                <PatientInfoBox patient_info={patient_info} />
            </div>
            <div className='flex-1 justify-end'>
                <InsuranceInfoBox insurance_info={insurance_info} />
            </div>


        </div>
    );
};

export default Ribbon;






