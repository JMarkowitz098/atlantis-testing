let res = {
    "custom_fields": [
        {
            "custom_field_id": "7160-908b-11e6-907f-00166bff25",
            "label": "Vehicle make and model year",
            "name": "Vehicle_make_and_model_year",
            "type": "string",
            "updated_at": "2016-01-23T13:48:44.108Z",
            "created_at": "2016-03-03T15:53:04.000+0000"
        }
    ],
        "_links": {
        "next": {
            "href": "/v3/activities/04fe9a97-a579-43c5-bb1a-58ed29bf0a6a"
        }
    }
}

let customFields = res.custom_fields.map(field => {
    return {
        name: `${field.label} (Custom)`,
        value: field.custom_field_id,
    };
});

console.log(customFields)