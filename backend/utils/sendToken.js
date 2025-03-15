export default (user, statusCode, res) => {
    const token = user.getJwtToken();

    const options = {
        expires: new Date (
            Date.now() + 10 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json({
        token,
    })
}