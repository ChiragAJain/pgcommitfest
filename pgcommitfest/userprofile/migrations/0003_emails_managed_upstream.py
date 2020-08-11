# Generated by Django 2.2.11 on 2020-08-11 11:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('userprofile', '0002_notifications'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userextraemail',
            name='confirmed',
        ),
        migrations.RemoveField(
            model_name='userextraemail',
            name='token',
        ),
        migrations.RemoveField(
            model_name='userextraemail',
            name='tokensent',
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='notifyemail',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='notifier', to='userprofile.UserExtraEmail', verbose_name='Notifications sent to'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='selectedemail',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='userprofile.UserExtraEmail', verbose_name='Sender email'),
        ),
    ]
