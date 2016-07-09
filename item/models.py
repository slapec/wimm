from django.db import models
from django.utils.translation import ugettext_lazy as _


class Item(models.Model):
    date = models.DateField(verbose_name=_('date'), db_index=True)
    price = models.DecimalField(max_digits=11, decimal_places=2)
    name = models.CharField(max_length=64, verbose_name=_('name'), blank=True)
    meta = models.CharField(max_length=65, verbose_name=_('meta'), blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ('date', 'created_at')

    def __str__(self):
        return '#{id} {date}: {name!r} {price}{meta}'.format(**{
            **self.__dict__,
            'meta': ' (' + repr(self.meta) + ')' if self.meta else ''
        })
