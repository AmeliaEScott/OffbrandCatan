from sqlalchemy.ext import mutable


def coerce(value, parent=None):
    if isinstance(value, dict):
        return MutableDict(value, parent=parent)
    elif isinstance(value, list):
        return MutableList(value, parent=parent)
    else:
        return value


class MutableDict(mutable.MutableDict):
    """
    Represents a dict that keeps track of mutations for SqlAlchemy.
    If it contains any dicts or lists, it will always attempt to coerce those into MutableDicts or MutableLists.
    When any of these are changed, it will propagate the event up the chain to its parents.
    """
    def __init__(self, data, parent):
        for key, value in data.items():
            data[key] = coerce(value, parent=self)
        super(MutableDict, self).__init__(**data)
        self.parent = parent

    def __setitem__(self, key, value):
        value = coerce(value, parent=self)
        super(MutableDict, self).__setitem__(key, value)

    def changed(self):
        super(MutableDict, self).changed()
        if self.parent is not None:
            self.parent.changed()


class MutableList(mutable.MutableList):
    """
    Similarly to MutableDict, this class tries to coerce all of its contents into MutableLists or MutableDicts.
    """
    # TODO: Override each mutation method to attempt to coerce the value when it changes.
    def __init__(self, data, parent=None):
        data = map(lambda x: coerce(x, parent=self), data)
        super(MutableList, self).__init__(data)
        self.parent = parent

    def changed(self):
        super(MutableList, self).changed()
        if self.parent is not None:
            self.parent.changed()
