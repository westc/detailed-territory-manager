var SETTINGS = {
    DIALOG_CLOSE_AND_SAVE_MESSAGE: '\xBFDesea guardar los cambios?',

    DIALOG_CLOSE_AND_SAVE_TITLE: null,

    // ${FILE_NAME} is just the name of the file used to print out the selected
    //              territories.
    // ${FILE_DIR} is the path to the directory containing the printout file.
    //             This ends with the system path delimiter.
    // ${FILE_PATH} is the entire file path of the file used to print out the
    //              selected territories.  This is basically the FILE_DIR
    //              followed by the FILE_NAME.
    DIALOG_DELETE_PRINTOUT_FILE_MESSAGE_FORMAT: '\xBFDesea eliminar el archivo impreso?\n\n${FILE_PATH}',

    DIALOG_DELETE_PRINTOUT_FILE_TITLE: 'Archivo impreso',

    // ${FILE_NAME} is just the name of the file used to print out the selected
    //              territories.
    // ${FILE_DIR} is the path to the directory containing the printout file.
    //             This ends with the system path delimiter.
    // ${FILE_PATH} is the entire file path of the file used to print out the
    //              selected territories.  This is basically the FILE_DIR
    //              followed by the FILE_NAME.
    DIALOG_PRINTOUT_PATH_COPIED_MESSAGE_FORMAT: 'La ruta del archivo impreso est\xE1 copiada al cach\xE9.',

    DIALOG_PRINTOUT_PATH_COPIED_TITLE: 'Ruta del archivo impreso',

    // ${TERRITORY_NUMBER} is the number of the territory.
    // ${TERRITORY_NAME} is the name of the territory.
    // ${HOUSE} is the current house number.
    // ${APT} is the current apartment number.
    // ${STREET} is the current street name.
    // ${DETAILS} is the value of the current details.
    // ${NEW_HOUSE} is the new house number.
    // ${NEW_APT} is the new apartment number.
    // ${NEW_STREET} is the new street name.
    // ${NEW_DETAILS} is the value of the new details.
    ERROR_ADDRESS_VALIDATION_TITLE_FORMAT: 'Error con la direcci\xF3n',
    ERROR_ADDRESS_VALIDATION_MESSAGE_FORMAT: null,
    ERROR_MISSING_HOUSE_MESSAGE_FORMAT: '- Necesita introducir el n\xFAmero de casa.',
    ERROR_MISSING_STREET_MESSAGE_FORMAT: '- Necesita introducir el nombre de calle.',

    // ${CURRENT_TERRITORY_NUMBER} is the current number of the territory.
    // ${CURRENT_TERRITORY_NAME} is the current name of the territory.
    // ${NEW_TERRITORY_NUMBER} is the newly selected number of the territory.
    // ${NEW_TERRITORY_NAME} is the newly selected name of the territory.
    // ${TERRITORY_NUMBER} is the number of the conflicting territory.
    // ${TERRITORY_NAME} is the name of the conflicting territory.
    ERROR_TERRITORY_VALIDATION_TITLE_FORMAT: 'Error con el territorio',
    ERROR_TERRITORY_VALIDATION_MESSAGE_FORMAT: null,
    ERROR_MISSING_TERRITORY_NUMBER_MESSAGE_FORMAT: '- Necesita introducir el n\xFAmero del territorio.',
    ERROR_TERRITORY_NUMBER_CONFLICT_MESSAGE_FORMAT: '- El n\xFAmero del territorio necesita cambiar porque un otro territorio con este n\xFAmero ya existe.',
    ERROR_MISSING_TERRITORY_NAME_MESSAGE_FORMAT: '- Necesita introducir el nombre del territorio.',

    ERROR_MISSING_FUNCTIONALITY_MESSAGE: 'Esta opci\xF3n todav\xEDa tiene que ser desarollada.',

    UNFLAG_TEXT: '- NO IMPRIMIR',
    FLAG_TEXT: '+ IMPRIMIR',

    LEFT_MENU_TERRITORIES_LABEL: 'Territorios',

    // ${TERRITORY_NUMBER} is the number of the territory.
    // ${TERRITORY_NAME} is the name of the territory.
    // ${TOTAL_ADDRESSES} is the total number of houses in the territory.
    // ${TOTAL_UNMARKED} is the total number of unmarked houses in the territory.
    // ${TOTAL_MARKED} is the total number of marked houses in the territory.
    LEFT_MENU_TERRITORIES_LIST_FORMAT: '${TERRITORY_NUMBER} - ${TERRITORY_NAME} (${TOTAL_UNFLAGGED}/${TOTAL_ADDRESSES})',

    LEFT_MENU_TERRITORIES_HINT: 'Selecciona los territorios para verlos, modificarlos, e imprimirlos.',

    LEFT_MENU_ADD_TERRITORY_BUTTON: 'A\xF1adir un territorio',

    LEFT_MENU_PRINT_BUTTON: 'Imprimir la selecci\xF3n',

    LEFT_MENU_SAVE_BUTTON: 'Guardar todo',

    LEFT_MENU_CLOSE_BUTTON: 'Salir',

    // ${TERRITORY_NUMBER} is the number of the territory.
    // ${TERRITORY_NAME} is the name of the territory.
    // ${TOTAL_ADDRESSES} is the total number of houses in the territory.
    // ${TOTAL_UNFLAGGED} is the total number of unmarked houses in the territory.
    // ${TOTAL_FLAGGED} is the total number of marked houses in the territory.
    LISTING_TERRITORY_TITLE_FORMAT: 'Territorio #${TERRITORY_NUMBER} - ${TERRITORY_NAME}',

    // The loading message for when the printout page first starts up.
    PRINTOUT_LOADING_MESSAGE: 'Cargando los registros...',

    // The instructions that appear at the top of the printout page.  This part
    // will not be printed out.
    PRINTOUT_INSTRUCTIONS_HEADER: 'Instrucciones',
    PRINTOUT_INSTRUCTIONS_TEXT: 'Se puede ajustar el margen de p\xE1gina para hacer caber el n\xFAmero de registros que quiere en cada p\xE1gina.  Es probable que va a tener que a ajustar las opciones de la impresora para imprimir la imagen de fondo.',

    // This path is local to the images folder under this application's folder.
    PRINTOUT_BACKGROUND_IMAGE: 'No Copiar 50.jpg',

    // This is an array of strings (case insensitive) and/or JavaScript RegExps
    // that will be bolded in the details column.
    PRINTOUT_BOLD_DETAILS: [
        'No desea visitas'
    ],

    // This is an array of strings (case insensitive) and/or JavaScript RegExps
    // that will be italicized in the details column.
    PRINTOUT_ITALIC_DETAILS: [
        'No desea visitas'
    ],

    RECORD_HOUSE_NUMBER_LABEL: 'Casa\xA0/\xA0Apt.',

    RECORD_DETAILS_LABEL: 'Calle y Observaciones',

    RECORD_TERRITORY_LABEL: 'Terr.',

    RECORD_PAGE_LABEL: 'P\xE1gina',

    // ${TERRITORY_NUMBER} is the number of the territory.
    // ${TERRITORY_NAME} is the name of the territory.
    RECORD_TERRITORY_FORMAT: '${TERRITORY_NUMBER} - ${TERRITORY_NAME}',

    // ${CURRENT_SHEET} is the number of the current sheet.
    // ${TOTAL_SHEETS} is the total number of sheets for this territory.
    RECORD_PAGE_FORMAT: '${CURRENT_SHEET}\xA0de\xA0${TOTAL_SHEETS}',

    // ${HOUSE} is the number of the house.
    // ${APT} is the value in the apartment field.
    RECORD_HOUSE_NUMBER_FORMAT: '${HOUSE}${"\xA0Apt\xA0",APT}',

    // Date/Time formatting is outlined here: http://cwestblog.com/2012/09/27/javascript-date-prototype-format/
    // ${CURRENT_SHEET} is the number of the current sheet.
    // ${TOTAL_SHEETS} is the total number of sheets for this territory.
    // ${TERRITORY_NUMBER} is the number of the territory.
    // ${TERRITORY_NAME} is the name of the territory.
    RECORD_FOOTER_FORMAT: "'Actualizado' D 'de' MMMM YYYY",

    RECORD_BLANKS_AFTER_EACH_HOUSE: 0,
    
    RECORD_BLANKS_BEFORE_STREET: 1,
    
    RECORD_BLANKS_AT_END_OF_TERRITORY: 0,

    RECORD_REPEAT_SAME_HOUSE_NUMBER: false
};