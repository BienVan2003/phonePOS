class Response {
        constructor(status, message, data, pageSize = null, pageNumber = null, pageTotal = null) {
                this.status = status;
                this.message = message;
                this.data = data;
                this.pageSize = pageSize;
                this.pageNumber = pageNumber;
                this.pageTotal = pageTotal;
        }
}

module.exports = Response;
