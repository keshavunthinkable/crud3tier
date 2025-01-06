import React from "react";

// We import bootstrap to make our application look better.
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle"

// We import NavLink to utilize the react router.
import { NavLink } from "react-router-dom";

// Here, we display our Navbar
export default function Navbar() {
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light p-2">
                <NavLink className="navbar-brand" to="/">
                    <img style={{ "width": "25%" }} src="https://d3cy9zhslanhfa.cloudfront.net/media/3800C044-6298-4575-A05D5C6B7623EE37/4B45D0EC-3482-4759-82DA37D8EA07D229/webimage-8A27671A-8A53-45DC-89D7BF8537F15A0D.png" alt=""></img>
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#nav
Unable to connect

Firefox can’t establish a connection to the server at localhost:3000.

    The site could be temporarily unavailable or too busy. Try again in a few moments.
    If you are unable to load any pages, check your computer’s network connection.
    If your computer or network is protected by a firewall or proxy, make sure that Firefox is permitted to access the web.barSupportedContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/create">
                                Create Record
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
}