const configureExpress = require('./config/express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = configureExpress();
const PORT = process.env.PORT || 3000;

app.use('/', routes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});