const express = require('express')
const app = express()

const fs = require('fs')

app.set('view engine', 'pug')

app.use('/static', express.static('public'))
app.use(express.urlencoded({ extended: false }))

const db = './data/posts.json'

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/admin', (req, res) => {
  res.render('admin')
})

app.get('/create', (req, res) => {
  res.render('create')
})

app.post('/create', (req, res) => {
  const title = req.body.title
  const name = req.body.name
  const surname = req.body.surname
  const gmail = req.body.gmail
  const description = req.body.description 

  if (title.trim() === '' && name.trim() === '' && surname.trim() === '' && gmail.trim() === '' && description.trim() === '') {
    res.render('create', { error: true })  
  } else {
    fs.readFile(db, (err, data) => {
      if (err) throw err

      const posts = JSON.parse(data)

      posts.push({
        id: id (),
        title: title,
        name: name,
        surname: surname,
        gmail: gmail,
        description: description,
        draft: true
      })

      fs.writeFile(db, JSON.stringify(posts), err => {
        if (err) throw err

        res.render('create', { success: true })
      })
    })
  }
})



app.get('/posts', (req, res) => {

  fs.readFile(db, (err,data) => {
    if (err) throw err

    const posts = JSON.parse(data).filter(post => post.draft !== true)

    res.render('posts', { posts: posts }) 
  })
})


app.get('/api/v1/posts', (req, res) => {

  fs.readFile(db, (err,data) => {
    if (err) throw err

    const posts = JSON.parse(data)

    res.json(posts)
  })
})


app.get('/drafts', (req, res) => {

  fs.readFile(db, (err,data) => {
    if (err) throw err

    const posts = JSON.parse(data).filter(post => post.draft === true)

    res.render('posts', { posts: posts }) 
  })
})


app.get('/posts/:id', (req,res) => {
  const id = req.params.id 
  
  fs.readFile(db, (err,data) => {
    if (err) throw err

    const posts = JSON.parse(data)

    const post = posts.filter(post => post.id == id)[0]

    res.render('detail', { post: post })
  })
})

app.get('/posts/:id/delete', (req, res) => {
  const id = req.params.id

  fs.readFile(db, (err,data) => {
    if (err) throw err

    const posts = JSON.parse(data)

    const filteredPosts = posts.filter(post => post.id !== id)

    console.log(filteredPosts)
    fs.writeFile(db, JSON.stringify(filteredPosts), err => {
        if (err) throw err
       res.render('posts', { id: id, posts: filteredPosts})
    })
  })
})

app.get('/posts/:id/activate', (req, res) => {
  fs.readFile(db, (err, data) => {
    if (err) res.sendStatus(500)

    const posts = JSON.parse(data)
    const post = posts.filter(post=> post.id == req.params.id)[0]
    
    const postIdx = posts.indexOf(post)
    const splicePost = posts.splice(postIdx, 1)[0]
    
    splicePost.draft = false
    posts.push(splicePost)
    
    fs.writeFile(db, JSON.stringify(posts), err => {
      if (err) res.sendStatus(500)
      res.redirect('/posts')
    })
  })
})

app.listen(5000, err => {
  if (err) console.log(err)

  console.log('Server is running on port 5000...')
})

 function id () {
  return '_' + Math.random().toString(36).substr(2, 9);
}