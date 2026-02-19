const subscriptionForm = () => {
    function handleSubmit (){
        console.log('HandleSubmit Fired!!!')
    }
  return (
    < div className="flex flex-col">
        <div className="p-2"> Payment Details </div>
        <form onSubmit={handleSubmit}>
            <label className="p-2">Name : </label>
            <input type='text' value="kiogora" placeholder="Enter Name"/>
            <button type="submit"></button>
        </form>
    </div>
  )
}

export default subscriptionForm