from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

from item.models import Item


class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ('date', 'price', 'name', 'meta')
        widgets = {
            'date': forms.TextInput(attrs={
                'placeholder': _('Date'),
                'tabindex': 1,
                'class': 'numeric'
            }),
            'price': forms.NumberInput(attrs={
                'placeholder': _('Price'),
                'tabindex': 2,
                'class': 'numeric'
            }),
            'name': forms.TextInput(attrs={'placeholder': _('Item name'), 'tabindex': 3}),
            'meta': forms.TextInput(attrs={'placeholder': _('Meta'), 'tabindex': 4})
        }

    def clean_price(self):
        price = self.cleaned_data['price']

        if price == 0:
            raise ValidationError(_('Zero is not allowed.'))

        return price
