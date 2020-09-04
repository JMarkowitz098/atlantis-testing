// First attempt by Jared

tray.on('CONFIG_SLOT_MOUNT', async ({
    event,
    previousWizardState,
    previousSlotState
}) => {

    let objectType = previousWizardState.values[tray.env.ccObjectTypeSlotExternalId];
    if (!objectType)
        return {
            ...event.data,
            value: undefined,
            status: 'HIDDEN',
        };
    let authId = previousWizardState.values[tray.env.ccAuthSlotExternalId];

    return {
        ...event.data,
        status: 'HIDDEN',
        value: await getCCFields(authId, objectType),
    };
});

tray.on('CONFIG_SLOT_VALUE_CHANGED', async ({
    event,
    previousWizardState,
    previousSlotState
}) => {
    if (event.data.externalId !== tray.env.ccObjectTypeSlotExternalId || !event.data.value)
        return;

    let authId = previousWizardState.values[tray.env.ccAuthSlotExternalId];
    let objectType = event.data.value;
    return {
        ...event.data,
        status: 'HIDDEN',
        value: await getCCFields(authId, objectType),
    };
});

async function getCCFields(authId, objectType) {

    try {
        let response = JSON.parse(await tray.callConnector({
            // Waiting on connector updates
            connector: 'constant-contact',
            authId,
            version: 'TBD',
            operation: 'raw_http_request',
            input: {
                method: 'GET',
                parse_response: 'true',
                include_raw_body: false,
                url: {
                    endpoint: `/v3/contact_custom_fields`
                },
            }
        }));

        let customFields = response.body.items.map(field => {
            return {
                name: `${field.label} (Custom)`,
                value: field.custom_field_id,
            };
        });
        
        return legacyFieldsList.concat(customFields);

    } catch (e) {
        return e.message
    }
}

const legacyFieldsList = [{
    text: 'Email',
    value: 'email_address'
}, {
    text: 'First Name',
    value: 'first_name'
}, {
    text: 'Last Name',
    value: 'last_name'
}, {
    text: 'Job Title',
    value: 'job_title'
}, {
    text: 'Company Name',
    value: 'company_name'
},  {
    text: 'Phone',
    value: 'phone_number'
}, {
    text: 'Anniversary',
    value: 'anniversary'
}, {
    text: 'Birthday',
    value: 'birthday'
}, {
    text: 'Type of Address',
    value: 'kind'
}, {
    text: 'Number and Street Name',
    value: 'street'
}, {
    text: 'City',
    value: 'city'
}, {
    text: 'State',
    value: 'state'
}, {
    text: 'Postal Code',
    value: 'postal_code'
}, {
    text: 'Country',
    value: 'country'
}];
