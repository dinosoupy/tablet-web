// IncsuranceInfoBox contains insurance info for display on the ribbon

const InsuranceInfoBox = ({ insurance_info }) => {
    return (
        <div>
            <p className="text-sm text-right font-medium leading-6 text-gray-500">Insurance: {insurance_info.provider} ({insurance_info.number})</p>
            <p className="text-sm text-right font-medium leading-6 text-gray-500">Group: {insurance_info.group}</p>
        </div>
    );
};

export default InsuranceInfoBox;

