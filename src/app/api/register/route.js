import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createUser, findUser, USER_TYPES } from "../../models/userModel.js";

export async function POST(req) {
  try {
    const { email, password, checkPassword, typeOfUser, firstName = '', lastName = '', phoneNumber = null } = await req.json();
    
    if (!email || !password || !checkPassword || !typeOfUser) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== checkPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (!Object.values(USER_TYPES).includes(typeOfUser)) {
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 400 }
      );
    }

    if(typeOfUser === USER_TYPES.USER){
      // Check if user already exists
      const existingUser = await findUser(email, USER_TYPES.USER).catch(() => null);
      if (existingUser) {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 409 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await createUser(email, hashedPassword, typeOfUser);

      return NextResponse.json(
        { 
          message: "User created successfully", 
          user: { 
            id: newUser.id, 
            email: newUser.email,
            type: typeOfUser 
          } 
        },
        { status: 201 }
      );

    }else if(typeOfUser === USER_TYPES.COURIER){
      // Check if user already exists
      const existingCourier = await findUser(email, USER_TYPES.COURIER).catch(() => null);
      if (existingCourier) {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 409 }
        );
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await createUser(email, hashedPassword, typeOfUser, firstName, lastName, phoneNumber);
      return NextResponse.json(
        { 
          message: "User created successfully", 
          user: { 
            id: newUser.id, 
            email: newUser.email,
            type: typeOfUser 
          } 
        },
        { status: 201 }
      );
    }
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}