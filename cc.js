const main = (input) => {
    const { dataMapping, list_id} = input
    const { answers, hidden, definition } = input.formResponse;
    let filteredAnswers = filterAnswersByDataMapper(answers, hidden, dataMapping)

    // Default for all subscriptions
    let defaultPayload = {
        list_memberships: [list_id]
    }
    
    let fieldPayload = createPayloadWithFieldAnswers(
        filteredAnswers.fieldAnswers, 
        dataMapping, 
        definition
    );

    let hiddenPayload;
    if (filteredAnswers.hiddenAnswers) 
        hiddenPayload = createPayloadWithHiddenAnswers(filteredAnswers.hiddenAnswers)

    let custom_fields = fieldPayload.customFields.concat(hiddenPayload.customFields)
    return {...defaultPayload, ...fieldPayload, ...hiddenPayload, custom_fields}
};

const filterAnswersByDataMapper = (fieldAnswers, hidden, dataMapping) => {
    let dmKeys = Object.keys(dataMapping);
    let hiddenAnswers

    if(typeof hidden === 'object') hiddenAnswers = Object.entries(hidden)
    
    fieldAnswers = fieldAnswers.filter(answer => 
        dmKeys.includes(answer.field.id))
    if (hiddenAnswers) hiddenAnswers = hiddenAnswers.filter(answer =>
        dmKeys.includes('hidden.' + answer[0]))
            
    return { fieldAnswers, hiddenAnswers }
}

const createPayloadWithFieldAnswers = (answers, dataMapping) => {
    let fieldPayload = {customFields: []}

    for (let answer of answers) {
        let ccField = dataMapping[answer.field.id]
        fieldPayload = fillPayloadByCCType(fieldPayload, answer, answer.type, ccField)
    }

    return fieldPayload;
}

const createPayloadWithHiddenAnswers = (hiddenObjs) => {
    let hiddenPayload = { customFields: []}

    for (const [hiddenField, hiddenVal] of hiddenObjs) {
        hiddenPayload = fillPayloadByCCType(hiddenPayload, hiddenVal, 'hidden', hiddenField )
    }

    return hiddenPayload;
}

const fillPayloadByCCType = (payload, answer, type, ccField) => {
    switch (ccField) {
        case 'email_address':
        case 'first_name':
        case 'last_name':
        case 'job_title':
        case 'company_name':
        case 'phone_number':
        case 'anniversary':
            payload[ccField] = getFieldByTFType(answer, type);
            break;

        case 'kind':
            if (!payload['street_address']) payload['street_address'] = {}
            payload['street_address'][ccField] = getFieldByTFType(answer, type).toLowerCase()
            break

        case 'street':
        case 'city':
        case 'state':
        case 'postal_code':
        case 'country':
            if (!payload['street_address']) payload['street_address'] = {} 
            payload['street_address'][ccField] = getFieldByTFType(answer, type);
            break;

        case 'birthday':
            payload = getBirthdayValues(payload, answer)
            break;

        default:
            payload['customFields'].push({
                custom_field_id: ccField,
                value: getFieldByTFType(answer, type)
            })
    }
    return payload
}

const getFieldByTFType = (answer, type) => {
    switch (type) {
        case "choice":
            return answer.choice.label;
        case "choices":
            let labels = answer.choices.labels;
            if (!labels) return null;
            return labels.join(',');
        case "number":
            return answer.number;
        case "phone_number":
            return answer.phone_number;
        case "text":
            return answer.text;
        case "boolean":
            return answer.boolean;
        case "email":
            return answer.email;
        case "date":
            return answer.date;
        case "url":
            return answer.url;
        case "hidden":
            return answer;
    }
}

const getBirthdayValues = (payload, answer) => {
    let dates = answer.date.split('-')
    payload["birthday_month"] = dates[1]
    payload["birthday_day"] = dates[2]
    return payload
}

// Input data received from Tray

let dataMapping = {
    "WoqRmrhw3cmM": "email_address",
    "MD6KmAUXKMn4": "first_name",
    "MXIo2SpbGiIi": "last_name",
    "buhp7al2D0tq": "phone_number",
    "Yx5nYSAOxy3v": "company_name",
    "qO4mlobwoA9t": "job_title",
    "hidden.anime": "anime",
    "hidden.weapon": "weapon",
    "tPXzGCZE2K8c": "anniversary",
    "bE6zX28dBN3r": "birthday",
    "gFCGKDe6yCqu": "kind",
    "V4pCWO0U4N4w": "street",
    "QoD54xbiENul": "city",
    "DGtciYV9UC26": "state",
    "N87YPrdHAcf0": "postal_code",
    "Y5DosIq02ScK": "country"
}


let answers = [
    {
        "type": "email",
        "email": "ikurosaki@gmail.com",
        "field": {
            "id": "WoqRmrhw3cmM",
            "type": "email",
            "ref": "10e957d7-7474-4154-b8c6-69b6c47d7d83"
        }
    },
    {
        "type": "text",
        "text": "Ichigo",
        "field": {
            "id": "MD6KmAUXKMn4",
            "type": "short_text",
            "ref": "1dd93f02-866c-4461-bf3f-f585a10b796f"
        }
    },
    {
        "type": "text",
        "text": "Kurosaki",
        "field": {
            "id": "MXIo2SpbGiIi",
            "type": "short_text",
            "ref": "799b2c78-617c-4adf-8a44-917267e9581f"
        }
    },
    {
        "type": "text",
        "text": "Shinigami",
        "field": {
            "id": "qO4mlobwoA9t",
            "type": "short_text",
            "ref": "56bf358e-7e2d-440b-b28a-1d083f993079"
        }
    },
    {
        "type": "text",
        "text": "Soul Society",
        "field": {
            "id": "Yx5nYSAOxy3v",
            "type": "short_text",
            "ref": "8e22549f-18fe-40f1-bc62-c1b5ac943089"
        }
    },
    {
        "type": "phone_number",
        "phone_number": "+18186348122",
        "field": {
            "id": "buhp7al2D0tq",
            "type": "phone_number",
            "ref": "39b207aa-7534-4942-8e0d-8e177e32e706"
        }
    },
    {
        "type": "date",
        "date": "2004-10-05",
        "field": {
            "id": "tPXzGCZE2K8c",
            "type": "date",
            "ref": "5ad59545-24fe-4dd0-8699-c57d0b4d7b68"
        }
    },
    {
        "type": "date",
        "date": "1990-07-15",
        "field": {
            "id": "bE6zX28dBN3r",
            "type": "date",
            "ref": "02c67ed0-d0b5-4216-9a56-5f8f5a863353"
        }
    },
    {
        "type": "text",
        "text": "dsad",
        "field": {
            "id": "djmxZVxFCcV5",
            "type": "long_text",
            "ref": "fd443979-a8fe-45e5-99fb-3831a402f4ba"
        }
    },
    {
        "type": "choice",
        "choice": {
            "label": "Home"
        },
        "field": {
            "id": "gFCGKDe6yCqu",
            "type": "dropdown",
            "ref": "68fdcc97-70ce-4b76-8111-6cecf0da4e63"
        }
    },
    {
        "type": "text",
        "text": "1234 Bleach Dr.",
        "field": {
            "id": "V4pCWO0U4N4w",
            "type": "short_text",
            "ref": "7329eab0-83e6-4bb3-8639-bdd7889d4932"
        }
    },
    {
        "type": "text",
        "text": "Karakura Town",
        "field": {
            "id": "QoD54xbiENul",
            "type": "short_text",
            "ref": "f713095e-dbe1-4cc2-92b8-f9694ac90ff4"
        }
    },
    {
        "type": "text",
        "text": "Kyoto District",
        "field": {
            "id": "DGtciYV9UC26",
            "type": "short_text",
            "ref": "2cb091f9-c844-4f69-8217-25ac936edc89"
        }
    },
    {
        "type": "text",
        "text": "12345",
        "field": {
            "id": "N87YPrdHAcf0",
            "type": "short_text",
            "ref": "9676609b-579e-4913-964b-8ee07417b28c"
        }
    },
    {
        "type": "text",
        "text": "Japan",
        "field": {
            "id": "Y5DosIq02ScK",
            "type": "short_text",
            "ref": "3d601da1-47c2-4892-ac2b-9ba5d7862954"
        }
    }
]

let hidden = {
    "anime": "bleach",
    "weapon": "bankai"
}

let definition = {
    "id": "jUGWhJBq",
    "title": "Constant Contact 1",
    "fields": [
        {
            "id": "WoqRmrhw3cmM",
            "title": "Email",
            "type": "email",
            "ref": "10e957d7-7474-4154-b8c6-69b6c47d7d83",
            "properties": {}
        },
        {
            "id": "MD6KmAUXKMn4",
            "title": "First name",
            "type": "short_text",
            "ref": "1dd93f02-866c-4461-bf3f-f585a10b796f",
            "properties": {}
        },
        {
            "id": "MXIo2SpbGiIi",
            "title": "Last name",
            "type": "short_text",
            "ref": "799b2c78-617c-4adf-8a44-917267e9581f",
            "properties": {}
        },
        {
            "id": "qO4mlobwoA9t",
            "title": "Job Title",
            "type": "short_text",
            "ref": "56bf358e-7e2d-440b-b28a-1d083f993079",
            "properties": {}
        },
        {
            "id": "Yx5nYSAOxy3v",
            "title": "Company Name",
            "type": "short_text",
            "ref": "8e22549f-18fe-40f1-bc62-c1b5ac943089",
            "properties": {}
        },
        {
            "id": "buhp7al2D0tq",
            "title": "Phone",
            "type": "phone_number",
            "ref": "39b207aa-7534-4942-8e0d-8e177e32e706",
            "properties": {}
        },
        {
            "id": "tPXzGCZE2K8c",
            "title": "Anniversary",
            "type": "date",
            "ref": "5ad59545-24fe-4dd0-8699-c57d0b4d7b68",
            "properties": {}
        },
        {
            "id": "bE6zX28dBN3r",
            "title": "Birthday",
            "type": "date",
            "ref": "02c67ed0-d0b5-4216-9a56-5f8f5a863353",
            "properties": {}
        },
        {
            "id": "djmxZVxFCcV5",
            "title": "Home addres",
            "type": "long_text",
            "ref": "fd443979-a8fe-45e5-99fb-3831a402f4ba",
            "properties": {}
        },
        {
            "id": "gFCGKDe6yCqu",
            "title": "Type",
            "type": "dropdown",
            "ref": "68fdcc97-70ce-4b76-8111-6cecf0da4e63",
            "properties": {}
        },
        {
            "id": "V4pCWO0U4N4w",
            "title": "Street number and name",
            "type": "short_text",
            "ref": "7329eab0-83e6-4bb3-8639-bdd7889d4932",
            "properties": {}
        },
        {
            "id": "QoD54xbiENul",
            "title": "City",
            "type": "short_text",
            "ref": "f713095e-dbe1-4cc2-92b8-f9694ac90ff4",
            "properties": {}
        },
        {
            "id": "DGtciYV9UC26",
            "title": "State",
            "type": "short_text",
            "ref": "2cb091f9-c844-4f69-8217-25ac936edc89",
            "properties": {}
        },
        {
            "id": "N87YPrdHAcf0",
            "title": "Zip code",
            "type": "short_text",
            "ref": "9676609b-579e-4913-964b-8ee07417b28c",
            "properties": {}
        },
        {
            "id": "Y5DosIq02ScK",
            "title": "Country",
            "type": "short_text",
            "ref": "3d601da1-47c2-4892-ac2b-9ba5d7862954",
            "properties": {}
        }
    ]
}

let list_id = "61191fd2-eba7-11ea-9578-d4ae529a8639"

// main --------------------

let formResponse = { answers, hidden, definition }
let input = { dataMapping, formResponse, list_id }

console.log(main(input))




