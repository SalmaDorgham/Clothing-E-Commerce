import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Error404 = () => {
  return (
    <>
    <div className='text-center m-5'>
      <h1>404 Not Found</h1>
      <h6>Your visited page not found. You may go home page</h6>

      <Link to='/'>
        <Button variant='dark' style={{ width: "300px", marginBottom: "5%", marginTop:"5%"}}>
          Back to Home Page
        </Button>
      </Link>
    </div>
    </>
  )
}

export default Error404