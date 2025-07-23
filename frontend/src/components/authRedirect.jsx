import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authentication";

const AuthRedirector = () => {



    const {
        loginDetails
    } = useAuthStore((s) => s);


    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token") ?? JSON.parse(localStorage.getItem("token"));

        console.log(token, "token")

        if (!token) {
            console.log(loginDetails, "eeeeeeeeeeeeeeeeeeeeeeeeeeee")
            navigate("/login"); // Otherwise, go to login
        }
    }, [navigate, loginDetails]);

    return null; // No UI
};

export default AuthRedirector;
