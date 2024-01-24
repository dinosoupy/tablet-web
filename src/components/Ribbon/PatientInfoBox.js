// PatientInfoBox contains patient info for display on the ribbon
import Image from 'next/image'

const PatientInfoBox = ({ patient_info }) => {
    return (
        <div className='flex'>
            <Image
                src="/avatar.jpg"
                alt="Patient avatar"
                className="rounded-xl"
                width={80}
                height={80}
                priority
            />
            <div className="overflow-hidden justify-between gap-x-4 gap-y-2 bg-white px-4 sm:px-6 xl:px-8">
                <p className="text-sm font-medium leading-6 text-gray-500">{patient_info.name}, {patient_info.gender}, {patient_info.age}</p>
                <p className="text-sm font-medium leading-6 text-gray-500">ID: {patient_info.id}</p>
            </div>
        </div>
    );
};

export default PatientInfoBox;

