"""
validators.py - Validateurs métier personnalisés pour NexusMine
"""
from django.core.exceptions import ValidationError
from datetime import datetime


def validate_date_range(start_date, end_date, field_name='date_fin'):
    """
    Validateur pour vérifier qu'une date de fin est après la date de début
    
    Params:
        start_date: DateTimeField ou DateField - date/heure de début
        end_date: DateTimeField ou DateField - date/heure de fin
        field_name: str - nom du champ pour le message d'erreur
        
    Raises:
        ValidationError si end_date <= start_date
    """
    if not start_date or not end_date:
        return
    
    # Convertir en datetime si nécessaire (pour les DateField)
    start = start_date if isinstance(start_date, datetime) else datetime.combine(start_date, datetime.min.time())
    end = end_date if isinstance(end_date, datetime) else datetime.combine(end_date, datetime.min.time())
    
    if start >= end:
        raise ValidationError({
            field_name: 'La date/heure de fin doit être après la date/heure de début.'
        })


def validate_maintenance_dates(cleaned_data):
    """
    Validateur pour le modèle Maintenance
    Assure que start_date < end_date si tous deux sont fournis
    """
    start_date = cleaned_data.get('start_date')
    end_date = cleaned_data.get('end_date')
    
    if start_date and end_date:
        try:
            validate_date_range(start_date, end_date, 'end_date')
        except ValidationError as e:
            raise ValidationError(e.message_dict if hasattr(e, 'message_dict') else e)


def validate_operation_times(cleaned_data):
    """
    Validateur pour le modèle Operation
    Assure que pour une opération donnée, start_time < end_time
    """
    date = cleaned_data.get('date')
    start_time = cleaned_data.get('start_time')
    end_time = cleaned_data.get('end_time')
    
    if date and start_time and end_time:
        # Combiner date + time pour créer des datetime comparables
        start_datetime = datetime.combine(date, start_time)
        end_datetime = datetime.combine(date, end_time)
        
        try:
            validate_date_range(start_datetime, end_datetime, 'end_time')
        except ValidationError as e:
            raise ValidationError(e.message_dict if hasattr(e, 'message_dict') else e)
