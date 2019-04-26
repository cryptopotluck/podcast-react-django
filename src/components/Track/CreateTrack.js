import React, {useState} from "react";
import {Mutation} from "react-apollo";
import {gql} from 'apollo-boost'
import axios from 'axios'
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import Error from '../Shared/Error';
import { GET_TRACKS_QUERY} from "../../pages/App";

const CreateTrack = ({ classes }) => {
  const  [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  const [submitting, setSumitting] = useState(false)

  const handleAudioChange = event => {
    const selectedFile = event.target.files[0]
    setFile(selectedFile)
  };

  const handleAudioUpload = async () => {
    try {
      const data = new FormData();
    data.append('file', file);
    data.append('resource_type', 'raw');
    data.append('upload_preset', 'podcast-app');
    data.append('cloud_name', 'cryptopotluck');
    const res = await axios.post('https://api.cloudinary.com/v1_1/cryptopotluck/raw/upload', data)
    return res.data.url
    } catch (err) {
      console.error('Error uploading file', err)
      setSumitting(false)

    }
  };

  const handleSubmit = async (event, createTrack) => {
    event.preventDefault();
    setSumitting(true);
    // upload our audio file, get returned url from API
    const uploadedUrl = await handleAudioUpload();
    createTrack({variables:{title, description, url: uploadedUrl}})
  };
  return (<>
    {/*create track button*/}
    <Button onClick={()=> setOpen(true)} variant="fab" className={classes.fab} color="secondary">
      {open ? <ClearIcon/> : <AddIcon/> }
    </Button>
    {/*create track dialog*/}
    <Mutation mutation={CREATE_TRACK_MUTATION} onCompleted={data => {
      console.log({data});
      setOpen(false);
      setSumitting(false)
    }}
    refetchQueries={() => [{query:GET_TRACKS_QUERY}]}
    >
      {(createTrack, { loading, error}) => {
        if (error) return <Error error={error}/>;

        return (
            <Dialog open={open} classes={classes.dialog}>
      <form onSubmit={event => handleSubmit(event, createTrack)}>
        <DialogTitle>Create Track</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a Title, Description & Podcast.mp3 File
          </DialogContentText>
          <FormControl fullWidth>
              <TextField
                label="Title"
                placeholder="Add Title"
                onChange={event => setTitle(event.target.value)}
                className={classes.textField}
                />
          </FormControl>
          <FormControl fullWidth>
              <TextField
                  multiline
                  rows='4'
                label="Description"
                placeholder="Add a description"
                  onChange={event => setDescription(event.target.value)}
                className={classes.textField}
                />
          </FormControl>
          <FormControl fullWidth>
              <input
                id="audio"
                accept="audio/mp3,audio/wav"
                required
                type="file"
                className={classes.input}
                onChange={handleAudioChange}
              />
              <label htmlFor="audio">
                  <Button variant="outlined" color={file ? "secondary" : " inherit" } component="span" className={classes.button}>
                    Audio File
                    <LibraryMusicIcon className={classes.icon}/>
                  </Button>
                {file && file.name}
              </label>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={()=> setOpen(false)} className={classes.cancel}>
            Cancel
          </Button>
          <Button disabled={
            submitting ||
            !title.trim() ||
            !description.trim() ||
                !file
          } type="submit" className={classes.save}>
            {submitting ? (
                <CircularProgress className={classes.save} size={24} />
            ) : (
                "Add Track"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
        )
      }}
    </Mutation>
    </>
  );
};

const CREATE_TRACK_MUTATION = gql`
    mutation ($title: String!, $description: String!, $url: String!) {
      createTrack(title: $title, description: $description, url: $url)
      {
      track {
        id
        title
        description
        url
      }
      }
    }
`;

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    zIndex: "200"
  }
});

export default withStyles(styles)(CreateTrack);
