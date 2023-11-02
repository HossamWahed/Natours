class APIFeatures {
  constructor(query, querystr) {
    this.query = query;
    this.querystr = querystr;
  }

  filter() {
    const queryObj = { ...this.querystr };
    const excludedfields = ['page', 'limit', 'sort', 'fields'];
    excludedfields.forEach((el) => delete queryObj[el]);

    let querystr = JSON.stringify(queryObj);
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(querystr));
    return this;
  }

  sort() {
    if (this.querystr.sort) {
      const sortB = this.querystr.sort.split(',')
      console.log(sortB)
      const sortBy = sortB.join(' ')
      console.log(sortBy)
      this.query = this.query.sort(sortBy);

    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitfields() {
    if (this.querystr.fields) {
      const fields = this.querystr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  panigation() {
    const page = this.querystr.page * 1 || 1;
    const limit = this.querystr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
