import { useState } from 'react';
import { Label } from '@radix-ui/react-label';
import { Input} from "../ui/input";
import React from 'react';
import { Button } from '../ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { s } from 'vite/dist/node/types.d-aGj9QkWt';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const changeEventHandler = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value,
        });
    }
    const submitHandler = async(e) => {
        e.preventDefault();
        console.log(input);
        try {
            setLoading(true);
            const res = await axios.post("http://localhost:5000/api/v1/user/register", input, {
                headers: {
                    "Content-Type": "application/json",
            },
            withCredentials: true
        });
        if(res.data.success){
            toast.success(res.data.message);
            setInput({
                username: "",
                email: "",
                password: "",
            });
        }

        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
        finally{
            setLoading(false);
        }

    }
  return (
    <div className='flex items-center w-screen h-screen justify-center'>
      <form onSubmit={submitHandler} className='shadow-lg flex flex-col gap-5 p-8'>
        <div className='my-4'>
            <h1 className='text-center font-bold text-xl'> Logo</h1>
            <p className='text-sm text-center'> Signup to see photos and videos from your friends</p>
        </div>
        <div>
            <Label>Username</Label>
            <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent "/>
        </div>
        <div>
            <Label>Email</Label>
            <Input
            type="text"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent "/>
        </div>
        <div>
            <Label>Password</Label>
            <Input
            type="text"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent "/>
        </div>
        <Button>Signup</Button>
      </form>
    </div>
  );
};

export default Signup;
