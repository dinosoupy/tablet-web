// IncsuranceInfoBox contains insurance info for display on the ribbon

const InsuranceInfoBox = ({ insurance_info }) => {
    return (
        <div className="text-right text-sm font-medium leading-6">
            <p>Insurance: {insurance_info.provider} ({insurance_info.number})</p>
            <p>Group: {insurance_info.group}</p>
        </div>
    );
};

export default InsuranceInfoBox;

