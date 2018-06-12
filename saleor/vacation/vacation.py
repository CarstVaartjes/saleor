import datetime as dt

vacation_list = \
    [dt.date(2018, 6, 13) + dt.timedelta(days=x) for x in range(0, 2)] + \
    [dt.date(2018, 7, 3) + dt.timedelta(days=x) for x in range(0, 1)] + \
    [dt.date(2018, 7, 11) + dt.timedelta(days=x) for x in range(0, 2)] + \
    [dt.date(2018, 7, 14) + dt.timedelta(days=x) for x in range(0, 1)] + \
    [dt.date(2018, 7, 23) + dt.timedelta(days=x) for x in range(0, 8)] + \
    [dt.date(2018, 8, 24) + dt.timedelta(days=x) for x in range(0, 9)] + \
    [dt.date(2018, 7, 11) + dt.timedelta(days=x) for x in range(0, 1)] + \
    [dt.date(2018, 9, 7) + dt.timedelta(days=x) for x in range(0, 1)] + \
    [dt.date(2018, 11, 3) + dt.timedelta(days=x) for x in range(0, 1)]
