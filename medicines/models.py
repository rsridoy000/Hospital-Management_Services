from django.db import models

class Medicine(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50) # e.g., Mg, Ml, Tablet

    def __str__(self):
        return self.name
