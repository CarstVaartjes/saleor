import datetime as dt

vacation_list = \
    [dt.date(2018, 2, 24) + dt.timedelta(days=x) for x in range(0, 4)] + \
    [dt.date(2018, 3, 9) + dt.timedelta(days=x) for x in range(0, 2)] + \
    [dt.date(2018, 3, 15) + dt.timedelta(days=x) for x in range(0, 3)]
