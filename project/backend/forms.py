from django import forms

class ScoringForm(forms.Form):
    your_name = forms.CharField(label='Организация', max_length=100)
    your_name1 = forms.CharField(label='Клиент', max_length=100)
    your_name2 = forms.CharField(label='Номер карты', max_length=100)
    your_name3 = forms.CharField(label='Срок действия', max_length=100)
    your_name4 = forms.CharField(label='Сумма займа, сом', max_length=100)
    your_name5 = forms.CharField(label='Срок займа, мес.', max_length=100)
    your_name6 = forms.CharField(label='Процентная ставка', max_length=100)
    your_name7 = forms.CharField(label='Скорбалл', max_length=100)