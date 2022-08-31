class ApiResourse {
  constructor(query, params) {
    this.query = query;
    this.params = params;
  }

  filter() {
    const queryParams = { ...this.params };
    const filterQuery = ['limit', 'page', 'sort', 'fields'];
    // console.log(query);
    filterQuery.forEach((element) => delete queryParams[element]);
    let strQuery = JSON.stringify(queryParams);
    strQuery = strQuery.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(strQuery));
    return this;
  }
  sorting() {
    if (this.params.sort) {
      const sorting = this.params.sort.split(',').join(' ');
      this.query.sort(sorting);
    } else {
      this.query.sort('-createdAt');
    }
    return this;
  }
  fields() {
    if (this.params.fields) {
      const selectableFields = this.params.fields.split(',').join(' ');
      this.query.select(selectableFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  limit() {
    this.params.limit = this.params.limit || 100;
    return this;
  }
  paginate() {
    const page = this.params.page || 1;
    const skip = (page - 1) * this.params.limit;
    this.query = this.query.skip(skip).limit(this.params.limit);
    return this;
  }
}

module.exports = ApiResourse;
