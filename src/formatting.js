import React, { useEffect } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryParams from 'query-params';
import { Field, reduxForm, change } from 'redux-form';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { authenticateUser, authShowInfoNotification } from 'actions/auth';
import AlertCircle from 'react-feather/dist/icons/alert-circle';
import {
  TERMS_OF_USE,
  PRIVACY_POLICY,
  USER_AGREEMENT,
  FORGOT_PASSWORD,
  REGISTRATION,
} from 'constants/routes';
import Layout from 'components/Layout';
import { required, email } from 'components/Forms/Validation';
import Notification from 'components/Notification';
import { renderField, getPendingEntriesCount, changeRoute } from 'helpers';
import retLogo from 'assets/img/ret-white-logo.svg';
import wcraLogo from 'assets/img/logo@2x.png';
import { GET_USER_PROFILE } from 'queries/GetUserProfile';
import { EVENT_ENTRY_UPCOMING_EVENTS } from 'constants/routes';
import { fetchUserByToken } from 'actions/user';
import { getURLQueryString, getTheme } from 'helpers';
import { WCRA, RET } from 'constants/theme/options';

const getQueryParams = (search) =>
  search ? queryParams.decode(search.substr(1)) : {};

function Login({
  handleSubmit, // from redux-form
  dispatch, // from react-redux connect
  errorMessage,
  loading,
  location,
  authData,
  ...props
}) {
  useEffect(() => {
    const emailParam = getURLQueryString(location, 'email');
    props.dispatch(change('login', 'email', emailParam));
  }, []);

  const onSubmit = async (values) => {
    const { dispatch, history, location } = props;
    const { redirect } = getQueryParams(location.search);
    const { email: emailVal, password: passwordVal } = values;
    const resp = await dispatch(authenticateUser(emailVal, passwordVal));

    if (redirect) {
      changeRoute({ history, route: redirect });
    } else if (resp && getPendingEntriesCount(resp.user) > 0) {
      // Redirect to My Entries upon login if there are pending entries
      changeRoute({ history, route: EVENT_ENTRY_UPCOMING_EVENTS });
    }
  };

  const onCloseInfoNotification = () => {
    const { dispatch } = props;
    dispatch(authShowInfoNotification(false));
  };

  const getInfoMessagePrefix = (theme) => {
    const prefix = theme === WCRA ? 'an' : 'a';
    return `${prefix} ${
      theme === WCRA ? RET.toUpperCase() : WCRA.toUpperCase()
    }`;
  };

  const { handleSubmit, loading, errorMessage, authData } = props;
  const { showInfoNotification } = authData || true;
  const theme = getTheme();
  const signInButton = loading ? (
    <button className='btn-main' disabled>
      Signing in...
    </button>
  ) : (
    <button action='submit' className='btn-main'>
      Sign In
    </button>
  );

  const prefix = getInfoMessagePrefix(theme);
  const infoMessage = `Have ${prefix} account? Use the same email and password to login`;

  return (
    <Layout className='bg-user' loading={loading}>
      <div className='grid-container'>
        <div className='grid-x'>
          <div className='small-12 large-6 centered ret-login-form'>
            {theme === 'wcra' ? (
              <img
                alt='ret'
                width='50%'
                className='ret-logo home-size p-md center-img'
                src={retLogo}
              />
            ) : (
              <img
                alt='wcra'
                className='wcra-logo home-size-xl p-sm center-img'
                src={wcraLogo}
              />
            )}

            <h2 className='section-title center login-header marbot-5'>
              {showInfoNotification && (
                <Notification
                  type='info'
                  showCloseButton
                  text={infoMessage}
                  onClose={onCloseInfoNotification}
                />
              )}
              Sign in
            </h2>
            <hr />
            <form onSubmit={handleSubmit(onSubmit)}>
              <Notification text={errorMessage} icon={<AlertCircle />} />
              <fieldset>
                <label htmlFor='email'>
                  {theme === 'ret' ? 'WCRA' : 'RET'} email *
                </label>
                <Field
                  name='email'
                  component={renderField}
                  type='email'
                  placeholder='Email Address'
                  validate={[required, email]}
                />
                <hr className='martop-0' />
                <label htmlFor='password'>
                  {theme === 'ret' ? 'WCRA' : 'RET'} password *
                </label>
                <Field
                  name='password'
                  component={renderField}
                  className='form-control login'
                  type='password'
                  placeholder='Password'
                  validate={[required]}
                />
                <hr className='martop-0' />
                <p className='terms-message'>
                  By logging in, I agree to the{' '}
                  <Link to={TERMS_OF_USE} target='_blank'>
                    Terms of Use
                  </Link>
                  ,{' '}
                  <Link to={PRIVACY_POLICY} target='_blank'>
                    Privacy Policy
                  </Link>
                  {' and '}
                  <Link to={USER_AGREEMENT} target='_blank'>
                    {theme === 'ret'
                      ? 'User Agreement'
                      : 'Virtual Qualifier User Agreement'}
                  </Link>
                </p>
                <div className='text-center'>
                  <Link to={FORGOT_PASSWORD} className='link-gold'>
                    I forgot my password
                  </Link>
                </div>
              </fieldset>
              <div className='text-center'>
                {signInButton}
                <br />
                <Link to={REGISTRATION} className='link-gold'>
                  I want to sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

Login.propTypes = {
  handleSubmit: PropTypes.func.isRequired, // from redux-form
  dispatch: PropTypes.func.isRequired, // from react-redux connect
  errorMessage: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  authData: PropTypes.object,
};

const mapStateToProps = (state) => ({
  errorMessage: state.auth.get('errorMessage'),
  loading: state.auth.get('loading'),
  user: state.user.get('data'),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  fetchUser: (token) => dispatch(fetchUserByToken(GET_USER_PROFILE, token)),
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'login',
  })
)(Login);
